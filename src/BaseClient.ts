import {Query} from "./generated/Query_pb";
import {Ed25519PrivateKey, Ed25519PublicKey} from "./Keys";

import {grpc} from "@improbable-eng/grpc-web";

import {CryptoGetAccountBalanceQuery} from "./generated/CryptoGetAccountBalance_pb";
import {QueryHeader} from "./generated/QueryHeader_pb";

import {
    accountIdToProto,
    handleQueryPrecheck,
    normalizeAccountId,
    reqDefined,
    tinybarRangeCheck
} from "./util";
import {ProtobufMessage} from "@improbable-eng/grpc-web/dist/typings/message";
import {AccountCreateTransaction} from "./account/AccountCreateTransaction";
import {CryptoTransferTransaction} from "./account/CryptoTransferTransaction";
import BigNumber from "bignumber.js";
import {CryptoService} from "./generated/CryptoService_pb_service";

import {Tinybar} from "./types/Tinybar";
import {Hbar} from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import {AccountId, AccountIdLike, accountIdToSdk} from "./types/AccountId";
import {TransactionId} from "./types/TransactionId";

export type Signer = (msg: Uint8Array) => Uint8Array | Promise<Uint8Array>;

/** If `privateKey` is a string it will be parsed as an `Ed25519PrivateKey` */
export type PrivateKey = { privateKey: Ed25519PrivateKey | string };
export type PubKeyAndSigner = {
    publicKey: Ed25519PublicKey;
    signer: Signer;
};

export type SigningOpts = PrivateKey | PubKeyAndSigner;

export type Operator = { account: AccountIdLike } & SigningOpts;

export type Nodes = {
    [url: string]: AccountIdLike;
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

    protected readonly nodes: [string, AccountId][];

    private _maxTransactionFee: Hbar = Hbar.of(1);
    private _maxQueryPayment?: Hbar;

    protected constructor(nodes: Nodes, operator: Operator) {
        this.nodes = (Array.isArray(nodes) ? nodes : Object.entries(nodes))
            .map(([url, acct]) => [url, normalizeAccountId(acct)]);
        this.operator = operator;
        this.operatorAcct = normalizeAccountId(operator.account);

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

    /** Get the current maximum transaction fee. */
    public get maxTransactionFee(): Hbar {
        return this._maxTransactionFee;
    }

    /** Get the current maximum query payment value, if set. */
    public get maxQueryPayment(): Hbar | undefined {
        return this._maxQueryPayment;
    }

    /**
     * Set the default maximum fee for a transaction.
     *
     * This can be overridden for an individual transaction with
     * `TransactionBuilder.setTransactionFee()`.
     *
     * If a transaction's fee will exceed this value, a `HederaError` will be thrown with
     * `ResponseCode.INSUFFICIENT_TX_FEE`.
     *
     * @param maxFee
     * @throws TinybarValueError if the value is out of range for the protocol
     */
    public setMaxTransactionFee(maxFee: Tinybar | Hbar): this {
        tinybarRangeCheck(maxFee);
        this._maxTransactionFee = maxFee instanceof Hbar ? maxFee : Hbar.fromTinybar(maxFee);
        return this;
    }

    /**
     * Set the max payment that can be automatically attached to a query.
     *
     * If this is not called then by default no payments will be made automatically for queries.
     *
     * If a query will cost more than this amount, a `MaxPaymentExceededError` will be thrown
     * from `QueryBuilder.execute()`.
     *
     * This can be overridden for an individual query with
     * `query.setPaymentDefault(await query.requestCost())`.
     *
     * @param maxPayment the maximum automatic payment for a query
     * @throws TinybarValueError if the value is out of range for the protocol
     */
    public setMaxQueryPayment(maxPayment: Tinybar | Hbar): this {
        tinybarRangeCheck(maxPayment);
        this._maxQueryPayment = maxPayment instanceof Hbar ? maxPayment : Hbar.fromTinybar(maxPayment);
        return this;
    }

    public createAccount(publicKey: Ed25519PublicKey, initialBalance = 100_000): Promise<{ account: AccountId }> {
        return new AccountCreateTransaction(this)
            .setKey(publicKey)
            .setInitialBalance(initialBalance)
            .setTransactionFee(10_000_000)
            .build()
            .executeForReceipt()
            .then((receipt) => ({
                account: accountIdToSdk(
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
    public transferCryptoTo(recipient: AccountIdLike, amount: number | BigNumber | Hbar): Promise<TransactionId> {
        const txn = new CryptoTransferTransaction(this)
            .addSender(this.operatorAcct, amount)
            .addRecipient(recipient, amount)
            .setTransactionFee(1_000_000)
            .build();

        return txn.executeForReceipt().then(() => txn.getTransactionId());
    }

    /** Get the current account balance in Tinybar */
    public getAccountBalance(): Promise<BigNumber> {
        const balanceQuery = new CryptoGetAccountBalanceQuery();
        balanceQuery.setAccountid(accountIdToProto(this.operatorAcct));

        const [url, nodeAccountID] = this._randomNode();

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

        return this._unaryCall(url, query, CryptoService.cryptoGetBalance)
            .then(handleQueryPrecheck((resp) => resp.getCryptogetaccountbalance()))
            .then((response) => new BigNumber(response.getBalance()));
    }

    /**
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
    // we're not using symbols because Flow doesn't support computed class properties and it's
    // much nicer to just use `flowgen` rather than maintaining our own redundant definitions files
    public _randomNode(): Node {
        return this.nodes[Math.floor(Math.random() * this.nodes.length)];
    }

    /**
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
    public _getNode(node: string | AccountId): Node {
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

    /**
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
    public abstract _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(url: string, request: Rq, method: UnaryMethodDefinition<Rq, Rs>): Promise<Rs>;
}
