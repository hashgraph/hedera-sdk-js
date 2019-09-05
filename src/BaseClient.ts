import {Query} from "./generated/Query_pb";
import {Ed25519PrivateKey, Ed25519PublicKey} from "./Keys";

import {grpc} from "@improbable-eng/grpc-web";

import {CryptoGetAccountBalanceQuery} from "./generated/CryptoGetAccountBalance_pb";
import {QueryHeader} from "./generated/QueryHeader_pb";

import {getProtoAccountId, getSdkAccountId, handleQueryPrecheck, reqDefined} from "./util";
import {ProtobufMessage} from "@improbable-eng/grpc-web/dist/typings/message";
import {AccountCreateTransaction} from "./account/AccountCreateTransaction";
import {CryptoTransferTransaction} from "./account/CryptoTransferTransaction";
import BigNumber from "bignumber.js";
import {CryptoService} from "./generated/CryptoService_pb_service";

import {AccountId, TransactionId} from "./typedefs";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

export type Signer = (msg: Uint8Array) => Uint8Array | Promise<Uint8Array>;

/** If `privateKey` is a string it will be parsed as an `Ed25519PrivateKey` */
export type PrivateKey = { privateKey: Ed25519PrivateKey | string };
export type PubKeyAndSigner = {
    publicKey: Ed25519PublicKey;
    signer: Signer;
};

export type SigningOpts = PrivateKey | PubKeyAndSigner;

export type Operator = { account: AccountId } & SigningOpts;

export type Nodes = {
    [url: string]: AccountId;
} | Node[];

/** A URL,AccountID pair identifying a Node */
export type Node = [string, AccountId];

export type ClientConfig = {
    nodes?: Nodes;
    operator: Operator;
};

export abstract class BaseClient {
    public readonly operator: Operator;
    private readonly operatorAcct: AccountId;
    public readonly operatorSigner: Signer;
    public readonly operatorPublicKey: Ed25519PublicKey;

    protected readonly nodes: Node[];

    public constructor(nodes: Nodes, operator: Operator) {
        this.nodes = Array.isArray(nodes) ? nodes : Object.entries(nodes);
        this.operator = operator;
        this.operatorAcct = operator.account;

        const maybePrivateKey = (operator as PrivateKey).privateKey;
        if (maybePrivateKey) {
            const privateKey = maybePrivateKey instanceof Ed25519PrivateKey
                ? maybePrivateKey
                : Ed25519PrivateKey.fromString(maybePrivateKey);
            this.operatorSigner = (msg): Uint8Array => privateKey.sign(msg);
            this.operatorPublicKey = privateKey.publicKey;
        } else {
            ({ publicKey: this.operatorPublicKey, signer: this.operatorSigner } =
                (operator as PubKeyAndSigner));
        }
    }

    public createAccount(publicKey: Ed25519PublicKey, initialBalance = 100_000): Promise<{ account: AccountId }> {
        return new AccountCreateTransaction(this)
            .setKey(publicKey)
            .setInitialBalance(initialBalance)
            .setTransactionFee(10_000_000)
            .build()
            .executeForReceipt()
            .then((receipt) => ({
                account: getSdkAccountId(
                    reqDefined(receipt.getAccountid(),
                        'missing account ID from receipt: ' + receipt)),
            }));
    }

    /**
     * Transfer the given amount from the operator account to the given recipient.
     *
     * Note that `number` can only represent exact integers in the range`[-2^53, 2^53)`.
     * To represent exact values higher than this you should use the `BigNumber` type instead.
     *
     * @param recipient
     * @param amount
     */
    public transferCryptoTo(recipient: AccountId, amount: number | BigNumber): Promise<TransactionId> {
        const txn = new CryptoTransferTransaction(this)
            .addSender(this.operatorAcct, amount)
            .addRecipient(recipient, amount)
            .setTransactionFee(1_000_000)
            .build();

        return txn.executeForReceipt().then(() => txn.getTransactionId());
    }

    public getAccountBalance(): Promise<BigNumber> {
        const balanceQuery = new CryptoGetAccountBalanceQuery();
        balanceQuery.setAccountid(getProtoAccountId(this.operatorAcct));

        const [url, nodeAccountID] = this.randomNode();

        const paymentTxn = new CryptoTransferTransaction(this)
            .addSender(this.operatorAcct, 0)
            .addRecipient(nodeAccountID, 0)
            .setTransactionFee(9)
            .build();

        const queryHeader = new QueryHeader();
        queryHeader.setPayment(paymentTxn.toProto());
        balanceQuery.setHeader(queryHeader);

        const query = new Query();
        query.setCryptogetaccountbalance(balanceQuery);

        return this.unaryCall(url, query, CryptoService.cryptoGetBalance)
            .then(handleQueryPrecheck((resp) => resp.getCryptogetaccountbalance()))
            .then((response) => new BigNumber(response.getBalance()));
    }

    public randomNode(): Node {
        return this.nodes[Math.floor(Math.random() * this.nodes.length)];
    }

    public getNode(node: string | AccountId): Node {
        const maybeNode = this.nodes.find(([url, accountId]) => url === node || (
            typeof node === 'object'
                && accountId.account == node.account
                && accountId.realm === node.realm
                && accountId.shard == node.shard
        ));

        if (maybeNode) {
            return maybeNode;
        }

        throw new Error(`could not find node: ${JSON.stringify(node)}`);
    }

    public abstract unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(url: string, request: Rq, method: UnaryMethodDefinition<Rq, Rs>): Promise<Rs>;
}
