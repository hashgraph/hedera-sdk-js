import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {BaseClient, Signer} from "./BaseClient";
import {SignatureMap, SignaturePair, TransactionID} from "./generated/BasicTypes_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {TransactionReceipt as ProtoTransactionReceipt} from "./generated/TransactionReceipt_pb";
import {
    handlePrecheck,
    handleQueryPrecheck,
    orThrow,
    setTimeoutAwaitable
} from "./util";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {TransactionGetReceiptQuery} from "./generated/TransactionGetReceipt_pb";
import {Query} from "./generated/Query_pb";
import {Message} from "google-protobuf";
import {Ed25519PrivateKey, Ed25519PublicKey} from "./Keys";
import {CryptoService} from "./generated/CryptoService_pb_service";
import {SmartContractService} from "./generated/SmartContractService_pb_service";
import {FileService} from "./generated/FileService_pb_service";
import {FreezeService} from "./generated/FreezeService_pb_service";
import {HederaError} from "./errors";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import {accountIdToSdk} from "./types/AccountId";
import {TransactionId, transactionIdToSdk} from "./types/TransactionId";
import {receiptToSdk, TransactionReceipt} from "./types/TransactionReceipt";
import {timestampToMs} from "./types/Timestamp";

/**
 * Signature/public key pairs are passed around as objects
 */
export type SignatureAndKey = {
    signature: Uint8Array;
    publicKey: Ed25519PublicKey;
};

const receiptInitialDelayMs = 1000;
const receiptRetryDelayMs = 500;

export class Transaction {
    private readonly client: BaseClient;

    private readonly nodeUrl: string;
    private readonly inner: Transaction_;
    private readonly txnId: TransactionID;
    private readonly validDurationSeconds: number;
    private readonly method: UnaryMethodDefinition<Transaction_, TransactionResponse>;

    /**
     * NOT A STABLE API
     *
     * This constructor is not meant to be invoked from user code. It is only public for
     * access from `TransactionBuilder.ts`. Usage may be broken in backwards-compatible
     * version bumps.
     */
    public constructor(client: BaseClient, nodeUrl: string, inner: Transaction_, body: TransactionBody, method: UnaryMethodDefinition<Transaction_, TransactionResponse>) {
        this.client = client;
        this.nodeUrl = nodeUrl;
        this.inner = inner;
        this.txnId = orThrow(body.getTransactionid());
        this.validDurationSeconds = orThrow(body.getTransactionvalidduration()).getSeconds();
        this.method = method;
    }

    public static fromBytes(client: BaseClient, bytes: Uint8Array): Transaction {
        const inner = Transaction_.deserializeBinary(bytes);
        const body = TransactionBody.deserializeBinary(inner.getBodybytes_asU8());

        const nodeAccountId = accountIdToSdk(
            orThrow(body.getNodeaccountid(), 'transaction missing node account ID'));

        const [url] = client._getNode(nodeAccountId);

        const method = methodFromTxn(body);

        return new Transaction(client, url, inner, body, method);
    }

    public getTransactionId(): TransactionId {
        return transactionIdToSdk(this.txnId);
    }

    public addSignature({ signature, publicKey }: SignatureAndKey): this {
        const sigPair = new SignaturePair();
        sigPair.setPubkeyprefix(publicKey.toBytes());
        sigPair.setEd25519(signature);

        const sigMap = this.inner.getSigmap() || new SignatureMap();
        sigMap.addSigpair(sigPair);
        this.inner.setSigmap(sigMap);

        return this;
    }

    public sign(privateKey: Ed25519PrivateKey): this {
        return this.addSignature({
            signature: privateKey.sign(this.inner.getBodybytes_asU8()),
            publicKey: privateKey.publicKey
        });
    }

    /**
     * Given the transaction body bytes, asynchronously return a signature and associated public
     * key.
     *
     * @param publicKey the public key that can be used to verify the returned signature
     * @param signer
     */
    public async signWith(publicKey: Ed25519PublicKey, signer: Signer): Promise<this> {
        const signResult = signer(this.inner.getBodybytes_asU8());
        const signature: Uint8Array = signResult instanceof Promise
            ? await signResult
            : signResult;

        this.addSignature({ signature, publicKey });
        return this;
    }

    public async execute(): Promise<TransactionId> {
        const sigMap = this.inner.getSigmap();

        if (!sigMap || sigMap.getSigpairList().length === 0) {
            await this.signWith(this.client.operatorPublicKey, this.client.operatorSigner);
        }

        handlePrecheck(await this.client._unaryCall(this.nodeUrl, this.inner, this.method));

        return this.getTransactionId();
    }

    public async executeForReceipt(): Promise<TransactionReceipt> {
        await this.execute();
        return receiptToSdk(await this.waitForReceipt());
    }

    private async getReceipt(): Promise<ProtoTransactionReceipt> {
        const receiptQuery = new TransactionGetReceiptQuery();
        receiptQuery.setTransactionid(this.txnId);
        const query = new Query();
        query.setTransactiongetreceipt(receiptQuery);

        return this.client._unaryCall(this.nodeUrl, query, CryptoService.getTransactionReceipts)
            .then(handleQueryPrecheck((resp) => resp.getTransactiongetreceipt()))
            .then((receipt) => orThrow(receipt.getReceipt()));
    }

    private async waitForReceipt(): Promise<ProtoTransactionReceipt> {
        const validStartMs = timestampToMs(orThrow(this.txnId.getTransactionvalidstart()));
        // set timeout at max valid duration
        const validUntilMs = validStartMs + 120000;

        await setTimeoutAwaitable(receiptInitialDelayMs);

        for (let attempt = 0;/* loop will exit when transaction expires */; attempt += 1) {
            const receipt = await this.getReceipt();

            // typecast required or we get a mismatching union type error
            if (([ResponseCodeEnum.UNKNOWN, ResponseCodeEnum.OK] as number[])
                .includes(receipt.getStatus())) {
                const delay = Math.floor(receiptRetryDelayMs
                    * Math.random() * (2 ** attempt - 1));

                if (Date.now() + delay > validUntilMs) {
                    throw new Error("timed out waiting for consensus on transaction ID: "
                        + this.txnId.toObject());
                }

                await setTimeoutAwaitable(delay);
            } else if (receipt.getStatus() !== ResponseCodeEnum.SUCCESS) {
                throw new HederaError(receipt.getStatus());
            } else {
                return receipt;
            }
        }
    }

    public toProto(): Transaction_ {
        return Message.cloneMessage(this.inner);
    }

    public toBytes(): Uint8Array {
        return this.inner.serializeBinary();
    }
}

function methodFromTxn(inner: TransactionBody): UnaryMethodDefinition<Transaction_, TransactionResponse> {
    switch (inner.getDataCase()) {
        case TransactionBody.DataCase.CONTRACTCALL:
            return SmartContractService.contractCallMethod;
        case TransactionBody.DataCase.CONTRACTCREATEINSTANCE:
            return SmartContractService.createContract;
        case TransactionBody.DataCase.CONTRACTUPDATEINSTANCE:
            return SmartContractService.updateContract;
        case TransactionBody.DataCase.CONTRACTDELETEINSTANCE:
            return SmartContractService.deleteContract;
        case TransactionBody.DataCase.CRYPTOADDCLAIM:
            return CryptoService.addClaim;
        case TransactionBody.DataCase.CRYPTOCREATEACCOUNT:
            return CryptoService.createAccount;
        case TransactionBody.DataCase.CRYPTODELETE:
            return CryptoService.cryptoDelete;
        case TransactionBody.DataCase.CRYPTODELETECLAIM:
            return CryptoService.deleteClaim;
        case TransactionBody.DataCase.CRYPTOTRANSFER:
            return CryptoService.cryptoTransfer;
        case TransactionBody.DataCase.CRYPTOUPDATEACCOUNT:
            return CryptoService.updateAccount;
        case TransactionBody.DataCase.FILEAPPEND:
            return FileService.appendContent;
        case TransactionBody.DataCase.FILECREATE:
            return FileService.createFile;
        case TransactionBody.DataCase.FILEDELETE:
            return FileService.deleteFile;
        case TransactionBody.DataCase.FILEUPDATE:
            return FileService.updateFile;
        case TransactionBody.DataCase.SYSTEMDELETE:
            return SmartContractService.systemDelete;
        case TransactionBody.DataCase.SYSTEMUNDELETE:
            return SmartContractService.systemUndelete;
        case TransactionBody.DataCase.FREEZE:
            return FreezeService.freeze;
        case TransactionBody.DataCase.DATA_NOT_SET:
            throw new Error('transaction body missing');
    }

    throw new Error('unsupported body case:' + inner.getDataCase().toString());
}
