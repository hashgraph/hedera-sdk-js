import * as nacl from "tweetnacl";
import { Transaction as ProtoTransaction } from "./generated/Transaction_pb";
import { TransactionBody } from "./generated/TransactionBody_pb";
import { BaseClient, TransactionSigner } from "./BaseClient";
import { SignatureMap, SignaturePair, TransactionID } from "./generated/BasicTypes_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { orThrow, setTimeoutAwaitable } from "./util";
import { Message } from "google-protobuf";
import { CryptoService } from "./generated/CryptoService_pb_service";
import { SmartContractService } from "./generated/SmartContractService_pb_service";
import { FileService } from "./generated/FileService_pb_service";
import { FreezeService } from "./generated/FreezeService_pb_service";
import { AccountId } from "./account/AccountId";
import { TransactionId } from "./TransactionId";
import { TransactionReceipt } from "./TransactionReceipt";
import { Ed25519PublicKey } from "./crypto/Ed25519PublicKey";
import { Ed25519PrivateKey } from "./crypto/Ed25519PrivateKey";
import { TransactionRecord } from "./TransactionRecord";
import { Status } from "./Status";
import * as base64 from "@stablelib/base64";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { HederaPrecheckStatusError } from "./errors/HederaPrecheckStatusError";

/** signature/public key pairs are passed around as objects */
export interface SignatureAndKey {
    signature: Uint8Array;
    publicKey: Ed25519PublicKey;
}

const receiptRetryDelayMs = 500;

/** internal method to create a new transaction from its discrete parts */
export const transactionCreate = Symbol("transactionCreate");

/** execute the transaction directly and return the protobuf response */
export const transactionCall = Symbol("transactionCall");

export class Transaction {
    private readonly _txnId: TransactionID;
    private readonly _validDurationSeconds: number;
    private readonly _method: UnaryMethodDefinition<ProtoTransaction, TransactionResponse>;
    private readonly _txns: ProtoTransaction[];

    private static [ transactionCreate ](
        proto: ProtoTransaction[],
        body: TransactionBody,
        method: UnaryMethodDefinition<ProtoTransaction, TransactionResponse>
    ): Transaction {
        const tx = Object.create(this.prototype);

        tx._txnId = orThrow(body.getTransactionid());
        tx._validDurationSeconds = orThrow(body.getTransactionvalidduration()).getSeconds();
        tx._method = method;
        tx._txns = proto;

        return tx;
    }

    private constructor() {
        throw new Error("the constructor of Transaction is private; please construct through TransactionBuilder");
    }

    public static fromBytes(bytes: Uint8Array): Transaction {
        const proto: ProtoTransaction = ProtoTransaction.deserializeBinary(bytes);
        const body = TransactionBody.deserializeBinary(proto.getBodybytes_asU8());

        AccountId._fromProto(orThrow(body.getNodeaccountid(), "transaction missing node account ID"));

        const method = methodFromTxn(body);

        return Transaction[ transactionCreate ]([ proto ], body, method);
    }

    public get id(): TransactionId {
        return TransactionId._fromProto(this._txnId);
    }

    private _checkPubKey(publicKey: Ed25519PublicKey): void {
        if (this._txns[ 0 ].hasSigmap()) {
            for (const sig of this._txns[ 0 ].getSigmap()!.getSigpairList()) {
                if (publicKey._bytesEqual(sig.getPubkeyprefix_asU8())) {
                    throw new Error(`transaction ${this._txnId} already signed with public key ${publicKey.toString()}`);
                }
            }
        }
    }

    private _addSignature(index: number, { signature, publicKey }: SignatureAndKey): this {
        const sigPair = new SignaturePair();
        sigPair.setPubkeyprefix(publicKey.toBytes());
        sigPair.setEd25519(signature);

        const sigMap = this._txns[ index ].getSigmap() || new SignatureMap();
        sigMap.addSigpair(sigPair);
        this._txns[ index ].setSigmap(sigMap);

        return this;
    }

    public sign(privateKey: Ed25519PrivateKey): this {
        this._checkPubKey(privateKey.publicKey);

        for (const [ index, transaction ] of this._txns.entries()) {
            this._addSignature(index, {
                signature: nacl.sign(transaction.getBodybytes_asU8(), privateKey._keyData),
                publicKey: privateKey.publicKey
            });
        }

        return this;
    }

    /**
     * Given the transaction body bytes, asynchronously return a signature and associated public
     * key.
     *
     * @param publicKey the public key that can be used to verify the returned signature
     * @param signer
     */
    public async signWith(publicKey: Ed25519PublicKey, signer: TransactionSigner): Promise<this> {
        this._checkPubKey(publicKey);

        for (const [ index, transaction ] of this._txns.entries()) {
            const signResult = signer(transaction.getBodybytes_asU8());
            const signature: Uint8Array = signResult instanceof Promise ?
                await signResult :
                signResult;

            this._addSignature(index, { signature, publicKey });
        }
        return this;
    }

    public async [ transactionCall ](client: BaseClient): Promise<TransactionResponse> {
        // If client is supplied make sure to sign transaction if we have not already
        if (client._getOperatorKey() && client._getOperatorSigner()) {
            await this.signWith(client._getOperatorKey()!, client._getOperatorSigner()!);
        }

        const validUntilMs = Date.now() + (this._validDurationSeconds * 1000);

        for (let attempt = 0; /* loop will exit when transaction expires */;) {
            for (const transaction of this._txns) {
                /* eslint-disable no-await-in-loop */
                const body = TransactionBody.deserializeBinary(transaction.getBodybytes_asU8());
                const node = client._getNode(AccountId._fromProto(body.getNodeaccountid()!));

                // we want to wait in a loop, that's the whole point here
                if (attempt > 0) {
                    const delay = Math.floor(receiptRetryDelayMs *
                        Math.random() * ((2 ** attempt) - 1));

                    if (Date.now() + delay > validUntilMs) {
                        throw new Error(`timed out waiting to send transaction ID: ${this._txnId.toString()}`);
                    }

                    await setTimeoutAwaitable(delay);
                }

                const response = await client._unaryCall(node.url, transaction, this._method);
                const status: Status = Status._fromCode(response.getNodetransactionprecheckcode());

                // If response code is BUSY we need to timeout and retry
                if (status._isBusy()) {
                    attempt += 1;
                    continue;
                }

                return response;
                /* eslint-enable no-await-in-loop */
            }
        }
    }

    public async execute(client: BaseClient): Promise<TransactionId> {
        const response = await this[ transactionCall ](client);
        const status: Status = Status._fromCode(response.getNodetransactionprecheckcode());

        HederaPrecheckStatusError._throwIfError(status.code, this.id);

        return this.id;
    }

    /** @deprecate `Transaction.getReceipt()` is deprecrated. Use `(await Transaction.execute()).getReceipt()` instead. */
    public getReceipt(client: BaseClient): Promise<TransactionReceipt> {
        console.warn("`Transaction.getReceipt()` is deprecrated. Use `(await Transaction.execute()).getReceipt()` instead.");
        return this.id.getReceipt(client);
    }

    /**
     * @deprecated `Transaction.getRecord()` is deprecrated. Use `(await Transaction.execute()).getRecord()` instead.
     */
    public getRecord(client: BaseClient): Promise<TransactionRecord> {
        console.warn("`Transaction.getRecord()` is deprecrated. Use `(await Transaction.execute()).getRecord()` instead.");
        return this.id.getRecord(client);
    }

    public _toProto(): ProtoTransaction {
        return Message.cloneMessage(this._txns[ 0 ]);
    }

    public toBytes(): Uint8Array {
        return this._txns[ 0 ].serializeBinary();
    }

    public toString(): string {
        const tx = this._toProto().toObject();
        const bodybytes = tx.bodybytes instanceof Uint8Array ?
            tx.bodybytes :
            base64.decode(tx.bodybytes);

        tx.body = TransactionBody.deserializeBinary(bodybytes).toObject();

        return JSON.stringify(tx, null, 4);
    }
}

/* eslint-disable-next-line max-len */
function methodFromTxn(inner: TransactionBody): UnaryMethodDefinition<ProtoTransaction, TransactionResponse> {
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
            throw new Error("transaction body missing");
        default:
            throw new Error(`unsupported body case:${inner.getDataCase().toString()}`);
    }
}
