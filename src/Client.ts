import * as nacl from "tweetnacl";
import {
    AccountID,
    Key,
    SignatureMap,
    SignaturePair,
    TransactionID
} from "./generated/BasicTypes_pb";
import {Query} from "./generated/Query_pb";
import {Transaction} from "./generated/Transaction_pb";
import {CryptoCreateTransactionBody} from "./generated/CryptoCreate_pb";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {decodePrivateKey, encodePrivateKey} from "./Keys";

import {grpc} from "@improbable-eng/grpc-web";

import {ServiceError} from "./generated/CryptoService_pb_service";

import * as crypto from 'crypto';
import {KeyObject} from 'crypto';
import {
    AccountAmount,
    CryptoTransferTransactionBody,
    TransferList
} from "./generated/CryptoTransfer_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {CryptoGetAccountBalanceQuery} from "./generated/CryptoGetAccountBalance_pb";
import {QueryHeader} from "./generated/QueryHeader_pb";

import {
    getMyAccountId,
    getMyTxnId,
    getProtoAccountId,
    isPrecheckCodeOk,
    newDuration,
    newTxnId,
    reversePrecheck
} from "./util";
import {ProtobufMessage} from "@improbable-eng/grpc-web/dist/typings/message";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import Code = grpc.Code;

export type AccountId = { shard: number, realm: number, account: number };

export type TransactionId = {
    account: AccountId,
    validStartSeconds: number,
    validStartNanos: number,
};

export type Operator = { account: AccountId, key: string };

const nodeAccountID = getProtoAccountId({ shard: 0, realm: 0, account: 3 });
const maxTxnFee = 10_000_000; // new testnet charges about 8M

const tinybarMaxSignedBigint = BigInt(1) << BigInt(63) - BigInt(1);
const tinybarMinSignedBigint = -tinybarMaxSignedBigint - BigInt(1);

export class Client {
    public readonly operator: Operator;
    private operatorAcct: AccountId;
    public readonly operatorPrivateKey: Uint8Array;
    public readonly operatorPublicKey: Uint8Array;

    // TODO: figure out how to switch this with the real proxy
    private readonly host: string = "http://localhost:11205";

    constructor(operator: Operator) {
        if (typeof operator.key !== 'string') {
            throw new Error('missing operator key');
        }

        this.operatorAcct = operator.account;
        const keyPair = decodePrivateKey(operator.key);

        this.operator = operator;

        ({ privateKey: this.operatorPrivateKey, publicKey: this.operatorPublicKey } = keyPair);
    }

    createAccount(publicKey: Uint8Array, initialBalance = 100_000): Promise<{ account: AccountId }> {
        const protoKey = new Key();
        protoKey.setEd25519(publicKey);

        const createBody = new CryptoCreateTransactionBody();
        createBody.setKey(protoKey);
        createBody.setInitialbalance(initialBalance);
        // 30 days, default recommended
        createBody.setAutorenewperiod(newDurationSeconds(30 * 86400));
        // Default to maximum values for record thresholds. Without this records would be
        // auto-created whenever a send or receive transaction takes place for this new account. This should
        // be an explicit ask.
        createBody.setReceiverecordthreshold(Number.MAX_SAFE_INTEGER);
        createBody.setSendrecordthreshold(Number.MAX_SAFE_INTEGER);

        const [txnId, txnBody] = this.newTxnBody();

        txnBody.setCryptocreateaccount(createBody);

        const txn = this.newSignedTxn(txnBody);

        return handlePrecheck((handler) => this.service.createAccount(txn, new grpc.Metadata(), handler))
            .then(() => this.waitForReceipt(txnId, orThrow(txnBody.getTransactionvalidduration())))
            .then(receipt => (
                { account: getMyAccountId(orThrow(receipt.getAccountid())) }
            ));
    }

    /**
     * Transfer the given amount from the operator account to the given recipient.
     *
     * Note that `number` can only represent exact integers in the range`[-2^53, 2^53)`.
     * To represent exact values higher than this you should use the ESNext type `BigInt` instead.
     *
     * @param recipient
     * @param amount
     */
    transferCryptoTo(recipient: AccountId, amount: number | BigInt): Promise<TransactionId> {
        const [txnId, txnBody, txn] = this.newTransferTxn(getProtoAccountId(recipient), amount);

        return handlePrecheck((handler) => this.service.cryptoTransfer(txn, new grpc.Metadata(), handler))
            .then(() => this.waitForReceipt(txnId, orThrow(txnBody.getTransactionvalidduration())))
            .then(() => getMyTxnId(txnId));
    }

    getAccountBalance(): Promise<number | BigInt> {
        const balanceQuery = new CryptoGetAccountBalanceQuery();
        balanceQuery.setAccountid(getProtoAccountId(this.operatorAcct));

        const queryHeader = new QueryHeader();
        queryHeader.setPayment(this.newTransferTxn(nodeAccountID, 0)[2]);
        balanceQuery.setHeader(queryHeader);

        const query = new Query();
        query.setCryptogetaccountbalance(balanceQuery);

        return new Promise((resolve, reject) => {
            this.service.cryptoGetBalance(query, new grpc.Metadata(), ((err, response) => {
                if (err != null) {
                    reject(err);
                } else if (response) {
                    const balanceResponse = orThrow(response.getCryptogetaccountbalance());
                    const precheckCode = orThrow(balanceResponse.getHeader())
                        .getNodetransactionprecheckcode();

                    if (isPrecheckCodeOk(precheckCode)) {
                        resolve(BigInt(balanceResponse.getBalance()));
                    } else {
                        reject(new Error(reversePrecheck(precheckCode)));
                    }
                }
            }));
        });
    }

    public unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage, M extends UnaryMethodDefinition<Rq, Rs>>(request: Rq, method: M): Promise<Rs> {
        return new Promise((resolve, reject) => grpc.unary(method, {
            host: this.host,
            request,
            onEnd: (response) => {
                if (response.status === Code.OK) {
                    // @ts-ignore TS thinks `response.message` is a generic `ProtobufMessage`
                    resolve(response.message);
                } else {
                    reject(new Error(response.statusMessage));
                }
            }
        }));
    }

    private newTxnBody(): [TransactionID, TransactionBody] {
        const txnId = newTxnId(this.operatorAcct);
        const txnBody = new TransactionBody();
        txnBody.setTransactionid(txnId);
        txnBody.setTransactionvalidduration(newDuration(120));
        txnBody.setNodeaccountid(nodeAccountID);
        txnBody.setTransactionfee(maxTxnFee);
        return [txnId, txnBody];
    }

    private newSignedTxn(body: TransactionBody): Transaction {
        const bodyBytes = body.serializeBinary();

        const txn = new Transaction();
        txn.setBodybytes(bodyBytes);

        const signature = nacl.sign.detached(bodyBytes, this.operatorPrivateKey);
        addSignature(txn, { key: this.operatorPublicKey, signature });

        return txn;
    }

    /**
     * Create and sign a CryptoTransferTransaction for submission a la carte or as payment for a
     * query.
     *
     * @param recipient
     * @param amount
     */
    private newTransferTxn(recipient: AccountID, amount: number | BigInt): [TransactionID, TransactionBody, Transaction] {
        if (typeof amount === 'bigint' && (amount > tinybarMaxSignedBigint || amount < tinybarMinSignedBigint)) {
            throw new Error('`amount` as bigint must be in the range [-2^63, 2^63)');
        } else if (typeof amount === 'number' && !Number.isSafeInteger(amount)) {
            throw new Error('`amount` as number must be in the range [-2^53, 2^53 - 1)');
        }

        const recvAmt = new AccountAmount();
        recvAmt.setAccountid(recipient);
        // IF YOU GET A TYPE ERROR HERE IT MEANS THE PROTOBUFS LOST THEIR JSTYPE ANNOTATIONS
        recvAmt.setAmount(String(amount));

        const sendAmt = new AccountAmount();
        sendAmt.setAccountid(getProtoAccountId(this.operatorAcct));
        sendAmt.setAmount(String(-amount));

        const transfers = new TransferList();
        transfers.addAccountamounts(recvAmt);
        transfers.addAccountamounts(sendAmt);

        const transferBody = new CryptoTransferTransactionBody();
        transferBody.setTransfers(transfers);

        const [txnId, txnBody] = this.newTxnBody();
        txnBody.setCryptotransfer(transferBody);

        const txn = this.newSignedTxn(txnBody);

        return [txnId, txnBody, txn];
    }

}

function orThrow<T>(val?: T): T {
    if (val !== null && val !== undefined) {
        return val;
    }

    throw new Error('expected value not to be null');
}

function handlePrecheck(withHandler: (handler: (error: ServiceError | null, response: TransactionResponse | null) => void) => void): Promise<TransactionResponse> {
    return new Promise(((resolve, reject) =>
        withHandler((err, response) => {
            if (err) {
                reject(err);
            } else if (response) {
                const precheck = response.getNodetransactionprecheckcode();

                if (isPrecheckCodeOk(precheck, true)) {
                    resolve(response);
                } else {
                    reject(new Error(reversePrecheck(precheck)));
                }
            }
        })));
}

function addSignature(txn: Transaction, { key, signature }) {
    const sigMap = txn.getSigmap() || new SignatureMap();
    const sigPair = new SignaturePair();
    sigPair.setPubkeyprefix(key);
    sigPair.setEd25519(signature);
    sigMap.addSigpair(sigPair);
    txn.setSigmap(sigMap);
}

