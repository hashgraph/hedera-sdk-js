import { grpc } from "@improbable-eng/grpc-web";
import * as nacl from "tweetnacl";

import { ProtobufMessage } from "@improbable-eng/grpc-web/dist/typings/message";

import { Hbar } from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { Ed25519PrivateKey } from "./crypto/Ed25519PrivateKey";
import { Ed25519PublicKey } from "./crypto/Ed25519PublicKey";
import { AccountId, AccountIdLike } from "./account/AccountId";
import { AccountBalanceQuery } from "./account/AccountBalanceQuery";

export type TransactionSigner = (msg: Uint8Array) => Uint8Array | Promise<Uint8Array>;

/** If `privateKey` is a string it will be parsed as an `Ed25519PrivateKey` */
export interface PrivateKey {
    privateKey: Ed25519PrivateKey | string;
}

export interface PubKeyAndSigner {
    publicKey: Ed25519PublicKey;
    signer: TransactionSigner;
}

export type SigningOpts = PrivateKey | PubKeyAndSigner;

export type Operator = { accountId: AccountIdLike } & SigningOpts;

export type Nodes = {
    [url: string]: AccountIdLike;
} | Node[];

/** A URL,AccountID pair identifying a Node */
export interface Node {
    url: string;
    id: AccountId;
}

export interface ClientConfig {
    network?: Nodes;
    operator?: Operator;
}

export abstract class BaseClient {
    private _operatorAccount?: AccountId;
    private _operatorSigner?: TransactionSigner;
    private _operatorPublicKey?: Ed25519PublicKey;

    protected _nodes: Node[] = [];

    // Default payment and transaction fees to 1 hbar

    // NOTE: This is a package-private API
    public _maxTransactionFee: Hbar = new Hbar(1);

    // NOTE: This is a package-private API
    public _maxQueryPayment: Hbar = new Hbar(1);

    protected constructor(network: Nodes, operator?: Operator) {
        this.replaceNodes(network);

        if (operator) {
            if ((operator as PrivateKey).privateKey != null) {
                this.setOperator(
                    operator.accountId,
                    (operator as PrivateKey).privateKey
                );
            } else {
                this.setOperatorWith(
                    operator.accountId,
                    (operator as PubKeyAndSigner).publicKey as Ed25519PublicKey,
                    (operator as PubKeyAndSigner).signer as TransactionSigner
                );
            }
        }
    }

    // Add a node to the list of nodes
    // @deprecate `BaseClient.putNode()` is deprecrated. Use `BaseClient.replaceNodes()` instead.
    public putNode(id: AccountIdLike, url: string): this {
        console.warn("`BaseClient.putNode()` is deprecrated. Use `BaseClient.replaceNodes()` instead.");
        this._nodes.push({ id: new AccountId(id), url });
        return this;
    }

    /** Set the operator for the client object */
    public setOperator(account: AccountIdLike, privateKey: Ed25519PrivateKey | string): this {
        const key = typeof privateKey === "string" ?
            Ed25519PrivateKey.fromString(privateKey as string) :
                        privateKey as Ed25519PrivateKey;

        this._operatorAccount = new AccountId(account);
        this._operatorPublicKey = key.publicKey;
        this._operatorSigner =
            (msg: Uint8Array): Uint8Array => nacl.sign.detached(msg, key._keyData);

        return this;
    }

    public setOperatorWith(
        account: AccountIdLike,
        publicKey: Ed25519PublicKey,
        signer: TransactionSigner
    ): this {
        this._operatorAccount = new AccountId(account);
        this._operatorPublicKey = publicKey;
        this._operatorSigner = signer;

        return this;
    }

    public replaceNodes(network: Nodes): this {
        this._nodes = Array.isArray(network) ?
            network as Node[] :
            Object.entries(network)
                .map(([ url, accountId ]) => {
                    const id = new AccountId(accountId);
                    return { url, id };
                });

        return this;
    }

    public _getOperatorAccountId(): AccountId | undefined {
        return this._operatorAccount;
    }

    public _getOperatorSigner(): TransactionSigner | undefined {
        return this._operatorSigner;
    }

    public _getOperatorKey(): Ed25519PublicKey | undefined {
        return this._operatorPublicKey;
    }

    /** Get the current maximum transaction fee. */
    public get maxTransactionFee(): Hbar {
        console.warn("deprecated: Client#maxTransactionFee is deprecated for removal with no replacement; please see #184");

        return this._maxTransactionFee;
    }

    /** Get the current maximum query payment. */
    public get maxQueryPayment(): Hbar | undefined {
        console.warn("deprecated: Client#maxQueryPayment is deprecated for removal with no replacement; please see #184");

        return this._maxQueryPayment;
    }

    /**
     * Set the default maximum fee for a transaction.
     *
     * This can be overridden for an individual transaction with
     * `TransactionBuilder.setMaxTransactionFee()`.
     *
     * If a transaction's fee will exceed this value, a `HederaStatusError` will be thrown with
     * `ResponseCode.INSUFFICIENT_TX_FEE`.
     *
     * @param maxFee
     */
    public setMaxTransactionFee(maxFee: Hbar): this {
        this._maxTransactionFee = maxFee;
        return this;
    }

    /**
     * Set the max payment that can be automatically attached to a query.
     *
     * If this is not called then by default no payments will be made automatically for queries.
     *
     * If a query will cost more than this amount, a `MaxQueryPaymentExceededError` will be thrown
     * from `QueryBuilder.execute()`.
     *
     * This can be overridden for an individual query with
     * `query.setPaymentDefault(await query.requestCost())`.
     *
     * @param maxPayment the maximum automatic payment for a query
     */
    public setMaxQueryPayment(maxPayment: Hbar): this {
        this._maxQueryPayment = maxPayment instanceof Hbar ?
            maxPayment :
            Hbar.fromTinybar(maxPayment);

        return this;
    }

    /**
     * Get the current account balance.
     * @deprecated `Client.getAccountBalance()` is deprecated with no replacement. Use the `AccountBalanceQuery` directly instead.
     */
    public getAccountBalance(id: AccountIdLike): Promise<Hbar> {
        console.warn("`Client.getAccountBalance()` is deprecated with no replacement. Use the `AccountBalanceQuery` directly instead");
        return new AccountBalanceQuery()
            .setAccountId(id)
            .execute(this);
    }

    public async ping(id: AccountIdLike): Promise<void> {
        await new AccountBalanceQuery()
            .setAccountId(id)
            .execute(this);
    }

    public _randomNode(): Node {
        return this._nodes[ Math.floor(Math.random() * this._nodes.length) ];
    }

    public _getNode(node: string | AccountId): Node {
        const maybeNode = this._nodes.find((_node) => _node.url === node ||
            typeof node === "object" &&
                _node.id.account === node.account &&
                _node.id.realm === node.realm &&
                _node.id.shard === node.shard);

        if (maybeNode) {
            return maybeNode;
        }

        throw new Error(`could not find node: ${JSON.stringify(node)}`);
    }

    /* eslint-disable-next-line @typescript-eslint/member-naming */
    public abstract _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(
        url: string, request: Rq, method: UnaryMethodDefinition<Rq, Rs>): Promise<Rs>;
}
