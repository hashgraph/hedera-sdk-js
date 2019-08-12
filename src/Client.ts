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
import {decodeKeyPair, encodeKey} from "./Keys";
import {CryptoServiceClient} from "./generated/CryptoService_pb_service";

import * as crypto from 'crypto';
import {KeyObject} from "crypto";

export type AccountId = { shard: number, realm: number, account: number };

export type Operator = { account: AccountId, key: string };

const nodeAccountID = getProtoAccountId({ shard: 0, realm: 0, account: 3 });
const maxTxnFee = 10_000_000; // new testnet charges about 8M

const receiptInitialDelayMs = 1000;
const receiptRetryDelayMs = 500;

export class Client {
    private operatorAcct: AccountId;
    private operatorPrivateKey: KeyObject;
    private operatorPubKey: KeyObject;

    private service: CryptoServiceClient;

    constructor(operator: Operator) {
        if (typeof operator.key !== 'string') {
            throw new Error('missing operator key');
        }

        this.operatorAcct = operator.account;

        ({ privateKey: this.operatorPrivateKey, publicKey: this.operatorPubKey } =
            decodeKeyPair(operator.key));

        // TODO: figure out how to switch this with the real proxy
        this.service = new CryptoServiceClient("http://localhost:11205")
    }

    createAccount(publicKey: KeyObject, initialBalance = 100_000): Promise<{ account: AccountId }> {
        const protoKey = new Key();
        protoKey.setEd25519(encodeKey(publicKey));

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

        const txnId = newTxnId(this.operatorAcct);
        const txnBody = new TransactionBody();
        txnBody.setTransactionid(txnId);
        txnBody.setCryptocreateaccount(createBody);
        txnBody.setTransactionvalidduration(newDurationSeconds(120));
        txnBody.setNodeaccountid(nodeAccountID);
        txnBody.setTransactionfee(maxTxnFee);

        const bodyBytes = txnBody.serializeBinary();

        const txn = new Transaction();
        txn.setBodybytes(bodyBytes);

        const signature = crypto.sign(null, bodyBytes, this.operatorPrivateKey);
        addSignature(txn, { key: this.operatorPubKey, signature });

        return new Promise(((resolve, reject) =>
            this.service.createAccount(txn, null,(err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const precheck = response.getNodetransactionprecheckcode();

                    if (isPrecheckCodeOk(precheck, true)) {
                        resolve(response);
                    } else {
                        reject(precheck);
                    }
                }
            })))
            .then(() => this.waitForReceipt(txnId, txnBody.getTransactionvalidduration()))
            .then(receipt => (
                { account: getMyAccountId(receipt.getAccountid()) }
            ));
    }

    private getReceipt(txnId: TransactionID): Promise<TransactionReceipt> {
        const receiptQuery = new TransactionGetReceiptQuery();
        receiptQuery.setTransactionid(txnId);
        const query = new Query();
        query.setTransactiongetreceipt(receiptQuery);

        return new Promise(((resolve, reject) => {
            this.service.getTransactionReceipts(query, null, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const getReceipt = response.getTransactiongetreceipt();
                    const precheck = getReceipt.getHeader().getNodetransactionprecheckcode();

                    if (isPrecheckCodeOk(precheck)) {
                        resolve(getReceipt.getReceipt());
                    } else {
                        reject(precheck);
                    }
                }
            })
        }));
    }

    private async waitForReceipt(txnId: TransactionID, validDuration: Duration): Promise<TransactionReceipt> {
        const validStartMs = timestampToMs(txnId.getTransactionvalidstart());
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
                throw receipt.getStatus();
            } else {
                return receipt;
            }
        }
    }
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

function timestampToMs(timestamp: Timestamp) {
    return timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1_000_000);
}

function newDurationSeconds(seconds: number): Duration {
    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

function addSignature(txn: Transaction, { key, signature }) {
    const sigMap = txn.getSigmap() || new SignatureMap();
    const sigPair = new SignaturePair();
    // the `crypto` module doesn't provide a way to get the raw public key which Hedera wants
    // fortunately the DER encoded representation is 44 bytes where the last 32 are our raw pub key
    sigPair.setPubkeyprefix(encodeKey(key).slice(12));
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

function setTimeoutAwaitable(timeoutMs: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}
