import {Transaction as Transaction_} from "./generated/Transaction_pb";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {Client, TransactionId} from "./Client";
import {SignatureMap, SignaturePair, TransactionID} from "./generated/BasicTypes_pb";
import * as crypto from "crypto";
import {KeyObject} from "crypto";
import {encodeKey} from "./Keys";
import {grpc} from "@improbable-eng/grpc-web";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {TransactionReceipt} from "./generated/TransactionReceipt_pb";
import {CryptoService} from "./generated/CryptoService_pb_service";
import {getMyTxnId, isPrecheckCodeOk, reversePrecheck, timestampToMs, setTimeoutAwaitable} from "./util";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {TransactionGetReceiptQuery} from "./generated/TransactionGetReceipt_pb";
import {Query} from "./generated/Query_pb";
import {Response} from "./generated/Response_pb";
import {ResponseHeader} from "./generated/ResponseHeader_pb";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Signature/public key pairs are passed around as objects
 */
export type SignatureAndKey = {
    signature: Uint8Array,
    publicKey: KeyObject
};

const receiptInitialDelayMs = 1000;
const receiptRetryDelayMs = 500;

export default class Transaction {
    private client: Client;

    private inner: Transaction_;
    private txnId: TransactionID;
    private validDurationSeconds: number;
    private method: UnaryMethodDefinition<Transaction_, TransactionResponse>;

    constructor(client: Client, inner: Transaction_, body: TransactionBody, method: UnaryMethodDefinition<Transaction_, TransactionResponse>) {
        this.client = client;
        this.inner = inner;
        this.txnId = body.getTransactionid();
        this.validDurationSeconds = body.getTransactionvalidduration().getSeconds();
        this.method = method;
    }

    /**
     * Given the transaction body bytes, asynchronously return a signature and associated public
     * key.
     *
     * @param signer
     */
    async signWith(signer: (bodyBytes: Uint8Array) => Promise<SignatureAndKey>): Promise<this> {
        return this.addSignature(await signer(this.inner.getBodybytes_asU8()));
    }

    addSignature({ signature, publicKey }: SignatureAndKey): this {
        const sigPair = new SignaturePair();

        // @ts-ignore FIXME TS defs don't have ed25519 yet
        if (publicKey.asymmetricKeyType === 'ed25519') {
            sigPair.setEd25519(signature);
        } else {
            throw new Error('unsupported signature type: ' + publicKey.asymmetricKeyType);
        }

        sigPair.setPubkeyprefix(encodeKey(publicKey));

        const sigMap = this.inner.getSigmap() || new SignatureMap();
        sigMap.addSigpair(sigPair);
        this.inner.setSigmap(sigMap);

        return this;
    }

    sign(privateKey: KeyObject): this {
        // @ts-ignore FIXME Typescript definitions don't include ed25519 yet
        if (privateKey.type !== 'private' || privateKey.asymmetricKeyType !== 'ed25519') {
            throw new Error('`privateKey` must be an ed25519 private key')
        }

        const signature = crypto.sign(null, this.inner.getBodybytes_asU8(), privateKey);
        const publicKey = crypto.createPublicKey(privateKey);

        return this.addSignature({ signature, publicKey });
    }

    execute(): Promise<TransactionId> {
        return this.client.unaryCall(this.inner, this.method)
            .then(handlePrecheck)
            .then(() => getMyTxnId(this.txnId));
    }

    async executeForReceipt(): Promise<TransactionReceipt> {
        await this.execute();
        return this.waitForReceipt()
    }

    private getReceipt(): Promise<TransactionReceipt> {
        const receiptQuery = new TransactionGetReceiptQuery();
        receiptQuery.setTransactionid(this.txnId);
        const query = new Query();
        query.setTransactiongetreceipt(receiptQuery);

        return this.client.unaryCall(query, CryptoService.getTransactionReceipts)
            .then(handlePaymentPrecheck(Response.prototype.getTransactiongetreceipt))
            .then((receptResponse) => receptResponse.getReceipt());
    }

    private async waitForReceipt(): Promise<TransactionReceipt> {
        const validStartMs = timestampToMs(this.txnId.getTransactionvalidstart());
        const validUntilMs = validStartMs + this.validDurationSeconds * 1000;

        await setTimeoutAwaitable(receiptInitialDelayMs);

        let attempt = 0;

        while (true) {
            const receipt = await this.getReceipt();

            // typecast required or we get a mismatching union type error
            if (([ResponseCodeEnum.UNKNOWN, ResponseCodeEnum.OK] as number[])
                .indexOf(receipt.getStatus()) > 0) {
                const delay = Math.floor(receiptRetryDelayMs
                    * Math.random() * (Math.pow(2, attempt) - 1));

                if (validStartMs + delay > validUntilMs) {
                    throw "timed out waiting for consensus on transaction ID: " + txnId.toObject();
                }
            } else if (receipt.getStatus() !== ResponseCodeEnum.SUCCESS) {
                throw new Error(reversePrecheck(receipt.getStatus()));
            } else {
                return receipt;
            }
        }
    }
}

function handlePrecheck(response: TransactionResponse): TransactionResponse {
    const precheck = response.getNodetransactionprecheckcode();

    if (isPrecheckCodeOk(precheck, true)) {
        return response;
    } else {
        throw new Error(reversePrecheck(precheck));
    }
}

interface SubResponse {
    getHeader(): ResponseHeader;
}

function handlePaymentPrecheck<Sr extends SubResponse>(getSubResponse: (Response) => Sr): (Response) => Sr {
    return (response) => {
        const subResponse = getSubResponse(response);
        const precheck = subResponse.getHeader().getNodetransactionprecheckcode();

        if (isPrecheckCodeOk(precheck)) {
            return subResponse;
        } else {
            throw new Error(reversePrecheck(precheck));
        }
    };
}
