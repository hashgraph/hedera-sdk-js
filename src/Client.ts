import * as nacl from "tweetnacl";
import {
    AccountID,
    Key,
    SignatureMap,
    SignaturePair,
    TransactionID
} from "./generated/BasicTypes_pb";
import {TransactionReceipt} from "./generated/TransactionReceipt_pb";
import {TransactionGetReceiptQuery} from "./generated/TransactionGetReceipt_pb";
import {Query} from "./generated/Query_pb";
import {Duration} from "./generated/Duration_pb";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {Timestamp} from "./generated/Timestamp_pb";
import {Transaction} from "./generated/Transaction_pb";
import {CryptoCreateTransactionBody} from "./generated/CryptoCreate_pb";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {decodeKey, encodeKey} from "./Keys";
import {CryptoServiceClient, ServiceError} from "./generated/CryptoService_pb_service";

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
import {grpc} from "@improbable-eng/grpc-web";

export type AccountId = { shard: number, realm: number, account: number };

export type TransactionId = {
    account: AccountId,
    validStartSeconds: number,
    validStartNanos: number,
};

export type Operator = { account: AccountId, key: string };

const nodeAccountID = getProtoAccountId({ shard: 0, realm: 0, account: 3 });
const maxTxnFee = 10_000_000; // new testnet charges about 8M

const receiptInitialDelayMs = 1000;
const receiptRetryDelayMs = 500;

const tinybarMaxSignedBigint = BigInt(1) << BigInt(63) - BigInt(1);
const tinybarMinSignedBigint = -tinybarMaxSignedBigint - BigInt(1);

export class Client {
    public readonly operator: Operator;
    private operatorAcct: AccountId;
    public readonly operatorPrivateKey: Uint8Array;
    public readonly operatorPublicKey: Uint8Array;

    private service: CryptoServiceClient;

    constructor(operator: Operator) {
        if (typeof operator.key !== 'string') {
            throw new Error('missing operator key');
        }

        this.operatorAcct = operator.account;
        const decodedKey = decodeKey(operator.key);

        this.operator = operator;

        ({ secretKey: this.operatorPrivateKey, publicKey: this.operatorPublicKey }
            = nacl.sign.keyPair.fromSeed(decodedKey));

        // TODO: figure out how to switch this with the real proxy
        this.service = new CryptoServiceClient("http://localhost:11205")
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

    private newTxnBody(): [TransactionID, TransactionBody] {
        const txnId = newTxnId(this.operatorAcct);
        const txnBody = new TransactionBody();
        txnBody.setTransactionid(txnId);
        txnBody.setTransactionvalidduration(newDurationSeconds(120));
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

    private getReceipt(txnId: TransactionID): Promise<TransactionReceipt> {
        const receiptQuery = new TransactionGetReceiptQuery();
        receiptQuery.setTransactionid(txnId);
        const query = new Query();
        query.setTransactiongetreceipt(receiptQuery);

        return new Promise(((resolve, reject) => {
            this.service.getTransactionReceipts(query, new grpc.Metadata(), (err, response) => {
                if (err) {
                    reject(err);
                } else if (response) {
                    const getReceipt = orThrow(response.getTransactiongetreceipt());
                    const precheck = orThrow(getReceipt.getHeader()).getNodetransactionprecheckcode();

                    if (isPrecheckCodeOk(precheck)) {
                        resolve(getReceipt.getReceipt());
                    } else {
                        reject(new Error(reversePrecheck(precheck)));
                    }
                }
            })
        }));
    }

    private async waitForReceipt(txnId: TransactionID, validDuration: Duration): Promise<TransactionReceipt> {
        const validStartMs = timestampToMs(orThrow(txnId.getTransactionvalidstart()));
        const validUntilMs = validStartMs + validDuration.getSeconds() * 1000;

        await setTimeoutAwaitable(receiptInitialDelayMs);

        let attempt = 0;

        while (true) {
            const receipt = await this.getReceipt(txnId);

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

function getProtoAccountId({ shard, realm, account }: AccountId): AccountID {
    const acctId = new AccountID();
    acctId.setShardnum(shard);
    acctId.setRealmnum(realm);
    acctId.setAccountnum(account);
    return acctId;
}

const getMyAccountId = (accountId: AccountID): AccountId => (
    {
        shard: accountId.getShardnum(),
        realm: accountId.getRealmnum(),
        account: accountId.getAccountnum()
    }
);

const getMyTxnId = (txnId: TransactionID): TransactionId => (
    {
        account: getMyAccountId(orThrow(txnId.getAccountid())),
        validStartSeconds: orThrow(txnId.getTransactionvalidstart()).getSeconds(),
        validStartNanos: orThrow(txnId.getTransactionvalidstart()).getNanos(),
    }
);

function newTxnId(accountId: AccountId): TransactionID {
    const acctId = getProtoAccountId(accountId);

    const validStart = new Timestamp();

    // allows the transaction to be accepted as long as the node isn't 10 seconds behind us
    const nowMs = Date.now() - 10_000;

    // get whole seconds since the epoch
    validStart.setSeconds(Math.floor(nowMs / 1000));
    // get remainder as nanoseconds
    validStart.setNanos(nowMs % 1000 * 1_000_000);

    const txnId = new TransactionID();
    txnId.setAccountid(acctId);
    txnId.setTransactionvalidstart(validStart);

    return txnId;
}

function timestampToMs(timestamp: Timestamp): number {
    return timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1_000_000);
}

function newDurationSeconds(seconds: number): Duration {
    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

function addSignature(txn: Transaction, { key, signature }: { key: Uint8Array, signature: Uint8Array }) {
    const sigMap = txn.getSigmap() || new SignatureMap();
    const sigPair = new SignaturePair();
    sigPair.setPubkeyprefix(key);
    sigPair.setEd25519(signature);
    sigMap.addSigpair(sigPair);
    txn.setSigmap(sigMap);
}

function isPrecheckCodeOk(code: number, unknownOk = false): boolean {
    switch (code) {
        case ResponseCodeEnum.SUCCESS:
        case ResponseCodeEnum.OK:
            return true;
        case ResponseCodeEnum.UNKNOWN:
            return unknownOk;
        default:
            return false;
    }
}

const reversePrechecks: { [code: number]: string } = Object.entries(ResponseCodeEnum)
    .reduce((map, [name, code]) => ({ ...map, [code]: name }), {});

const reversePrecheck = (code: number): string => reversePrechecks[code] || `unknown precheck code: ${code}`;

function setTimeoutAwaitable(timeoutMs: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}
