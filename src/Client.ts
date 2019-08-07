import {CryptoServiceClient} from "./generated/CryptoServiceServiceClientPb";
import * as nacl from "tweetnacl";
import {CryptoCreateTransactionBody} from "./generated/CryptoCreate_pb";
import {
    AccountID,
    Key,
    SignatureMap,
    SignaturePair,
    TransactionID
} from "./generated/BasicTypes_pb";
import {Transaction} from "./generated/Transaction_pb";
import {TransactionBody} from "./generated/TransactionBody_pb";
import {Timestamp} from "./generated/Timestamp_pb";
import {Duration} from "./generated/Duration_pb";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {TransactionReceipt} from "./generated/TransactionReceipt_pb";
import {Query} from "./generated/Query_pb";
import {TransactionGetReceiptQuery} from "./generated/TransactionGetReceipt_pb";

import * as asn1js from "asn1js";
import * as pvutils from "pvutils";

export type AccountId = { shard: number, realm: number, account: number };

export type Operator = { account: AccountId, key: String };

declare const __TEST__: boolean;

const nodeAccountID = getProtoAccountId({ shard: 0, realm: 0, account: 3 });
const maxTxnFee = 10_000_000; // new testnet charges about 8M

const receiptInitialDelayMs = 1000;
const receiptRetryDelayMs = 500;

export class Client {
    private operator: Operator;

    private service: CryptoServiceClient;

    constructor(operator: Operator) {
        this.operator = operator;
        // TODO: figure out how to switch this with the real proxy
        this.service = new CryptoServiceClient("http://localhost:11205")
    }

    createAccount(initialBalance = 100_000): Promise<{ account: AccountId, key: String }> {
        const { secretKey, publicKey } = nacl.sign.keyPair();

        const protoKey = new Key();
        protoKey.setEd25519(publicKey);

        const createBody = new CryptoCreateTransactionBody();
        createBody.setKey(protoKey);
        createBody.setInitialbalance(initialBalance);

        const txnId = newTxnId(this.operator.account);
        const txnBody = new TransactionBody();
        txnBody.setTransactionid(txnId);
        txnBody.setCryptocreateaccount(createBody);
        txnBody.setTransactionvalidduration(newDurationSeconds(120));
        txnBody.setNodeaccountid(nodeAccountID);
        txnBody.setTransactionfee(maxTxnFee);

        const bodyBytes = txnBody.serializeBinary();

        const txn = new Transaction();
        txn.setBodybytes(bodyBytes);

        const signature = nacl.sign(bodyBytes, secretKey);
        addSignature(txn, { key: publicKey, signature });

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
                { account: getMyAccountId(receipt.getAccountid()), key: encodeKey(secretKey) }
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

            if ([ResponseCodeEnum.UNKNOWN, ResponseCodeEnum.OK].indexOf(receipt.getStatus()) > 0) {
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
    sigPair.setPubkeyprefix(key);
    sigPair.setEd25519(signature);
    sigMap.addSigpair(sigPair);
    txn.setSigmap(sigMap);
}

function isPrecheckCodeOk(code: ResponseCodeEnum, unknownOk = false): boolean {
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

const ed25519Identifier = getSequence(new asn1js.ObjectIdentifier({ value: '1.3.101.112' }));

function encodeKey(privateKey: Uint8Array): String {
    // this double-encoding is *apparently* necessary.
    const keyString = new asn1js.OctetString({ valueHex: privateKey.buffer }).toBER();

    const keySeq = getSequence(
        new asn1js.Integer({ value : 0 }),
        ed25519Identifier,
        new asn1js.OctetString({ valueHex: keyString }),
    );

    return pvutils.bufferToHexCodes(keySeq.toBER());
}

function getSequence(...value: Object[]): asn1js.Sequence {
    return new asn1js.Sequence({ value });
}

function setTimeoutAwaitable(timeoutMs: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

export const _testExports = !!__TEST__ ? { encodeKey } : {};