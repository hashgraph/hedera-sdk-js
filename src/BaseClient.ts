import { grpc } from "@improbable-eng/grpc-web";

import { ProtobufMessage } from "@improbable-eng/grpc-web/dist/typings/message";

import { Hbar } from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { Ed25519PrivateKey } from "./crypto/Ed25519PrivateKey";
import { Ed25519PublicKey } from "./crypto/Ed25519PublicKey";
import { AccountId, AccountIdLike } from "./account/AccountId";
import { Tinybar, tinybarRangeCheck } from "./Tinybar";
import { AccountBalanceQuery } from "./account/AccountBalanceQuery";

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
export type Node = {
    url: string;
    id: AccountId;
}

export type ClientConfig = {
    network?: Nodes;
    operator: Operator;
};

export abstract class BaseClient {
    public operator?: Operator;
    private _operatorAcct?: AccountId;
    public operatorSigner?: Signer;
    public operatorPublicKey?: Ed25519PublicKey;

    protected readonly _nodes: Node[];

    // Default payment and transaction fees to 1 hbar
    private _maxTransactionFee: Hbar = Hbar.of(1);
    private _maxQueryPayment?: Hbar = Hbar.of(1);

    protected constructor(network: Nodes, operator?: Operator) {
        this._nodes = Array.isArray(network) ?
            network as Node[] :
            Object.entries(network)
                .map(([ url, accountId ]) => {
                    const id = new AccountId(accountId as AccountIdLike);
                    return { url, id };
                });

        if (operator) {
            this.setOperator(operator);
        }
    }

    /** Add a node to the list of nodes */
    public putNode(id: AccountIdLike, url: string): this {
        this._nodes.push({ id: new AccountId(id), url });
        return this;
    }

    /** Set the operator for the client object */
    public setOperator(operator: Operator): this {
        this.operator = operator;

        this._operatorAcct = new AccountId(operator.account);

        const maybePrivateKey = (operator as PrivateKey).privateKey;
        if (maybePrivateKey) {
            const privateKey = maybePrivateKey instanceof Ed25519PrivateKey ?
                maybePrivateKey :
                Ed25519PrivateKey.fromString(maybePrivateKey);
            this.operatorSigner = (msg): Uint8Array => privateKey.sign(msg);
            this.operatorPublicKey = privateKey.publicKey;
        } else {
            ({ publicKey: this.operatorPublicKey, signer: this.operatorSigner } =
                (operator as PubKeyAndSigner));
        }

        return this;
    }

    /** Get the current maximum transaction fee. */
    public get maxTransactionFee(): Hbar {
        return this._maxTransactionFee;
    }

    /** Get the current maximum query payment. */
    public get maxQueryPayment(): Hbar | undefined {
        return this._maxQueryPayment;
    }

    /**
     * Set the default maximum fee for a transaction.
     *
     * This can be overridden for an individual transaction with
     * `TransactionBuilder.setMaxTransactionFee()`.
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

        this._maxQueryPayment = maxPayment instanceof Hbar ?
            maxPayment :
            Hbar.fromTinybar(maxPayment);

        return this;
    }

    /** Get the current account balance. */
    public getAccountBalance(id: AccountIdLike): Promise<Hbar> {
        return new AccountBalanceQuery()
            .setAccountId(id)
            .execute(this);
    }

    public _randomNode(): Node {
        return this._nodes[ Math.floor(Math.random() * this._nodes.length) ];
    }

    public _getNode(node: string | AccountId): Node {
        const maybeNode = this._nodes.find((_node) => _node.url === node || (
            typeof node === "object" &&
                _node.id.account === node.account &&
                _node.id.realm === node.realm &&
                _node.id.shard === node.shard
        ));

        if (maybeNode) {
            return maybeNode;
        }

        throw new Error(`could not find node: ${JSON.stringify(node)}`);
    }

    public abstract _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(
        url: string, request: Rq, method: UnaryMethodDefinition<Rq, Rs>): Promise<Rs>;
}
