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
import {Response} from "./generated/Response_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {ResponseCodeEnum} from "./generated/ResponseCode_pb";
import {TransactionReceipt} from "./generated/TransactionReceipt_pb";

export type AccountId = { shard: number, realm: number, account: number };

export type Operator = { account: AccountId, key: String };

const nodeAccountID = getProtoAccountId({ shard: 0, realm: 0, account: 3 });
const maxTxnFee = 10_000_000; // new testnet charges about 8M

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

        const bodyBytes = txnBody.serializeBinary();

        const txn = new Transaction();
        txn.setBodybytes(bodyBytes);

        const signature = nacl.sign(bodyBytes, secretKey);
        addSignature(txn, { key: publicKey, signature });

        return new Promise(((resolve, reject) =>
            this.service.createAccount(txn, null,(err, response) => {
                if (err) {
                    reject(err);
                } else if (isPrecheckCodeOk(response)) {
                    resolve(response);
                } else {

                }
            })))
            .then(() => this.waitForReceipt(txnId))
            .then();
    }

    private getReceipt(txnId: TransactionID): Promise<TransactionReceipt> {

    }

    private async waitForReceipt(txnId: TransactionID): Promise<TransactionReceipt> {

    }
}

function waitForReceipt()

function getProtoAccountId({ shard, realm, account }: AccountId): AccountID {
    const acctId = new AccountID();
    acctId.setShardnum(shard);
    acctId.setRealmnum(realm);
    acctId.setAccountnum(account);
    return acctId;
}

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

function isPrecheckCodeOk(resp: TransactionResponse): boolean {
    switch (resp.getNodetransactionprecheckcode()) {
        case ResponseCodeEnum.SUCCESS:
        case ResponseCodeEnum.OK:
            return true;
        default:
            return false;
    }
}