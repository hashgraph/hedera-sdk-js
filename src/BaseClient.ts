import { Query } from "./generated/Query_pb";

import { grpc } from "@improbable-eng/grpc-web";

import { CryptoGetAccountBalanceQuery } from "./generated/CryptoGetAccountBalance_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";

import { handleQueryPrecheck } from "./util";
import { ProtobufMessage } from "@improbable-eng/grpc-web/dist/typings/message";
import { CryptoTransferTransaction } from "./account/CryptoTransferTransaction";
import BigNumber from "bignumber.js";
import { CryptoService } from "./generated/CryptoService_pb_service";

import { Hbar, hbarUnits } from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { Ed25519PrivateKey } from "./crypto/Ed25519PrivateKey";
import { Ed25519PublicKey } from "./crypto/Ed25519PublicKey";
import { AccountId, AccountIdLike, accountIdToProto, normalizeAccountId } from "./account/AccountId";
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
    nodes?: Nodes;
    operator: Operator;
};

export abstract class BaseClient {
    public readonly operator: Operator;
    private readonly _operatorAcct: AccountId;
    public readonly operatorSigner: Signer;
    public readonly operatorPublicKey: Ed25519PublicKey;

    protected readonly _nodes: Node[];

    // Default payment and transaction fees to 1 hbar
    private _maxTransactionFee: Hbar = Hbar.of(1);
    private _maxQueryPayment?: Hbar = Hbar.of(1);

    protected constructor(nodes: Nodes, operator: Operator) {
        this._nodes = Array.isArray(nodes) ?
            nodes as Node[] :
            Object.entries(nodes)
                .map(([ url, accountId ]) => {
                    const id = normalizeAccountId(accountId as AccountIdLike);
                    return { url, id };
                });

        this.operator = operator;

        this._operatorAcct = normalizeAccountId(operator.account);

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
    public getAccountBalance(): Promise<Hbar> {
        return new AccountBalanceQuery()
            .setAccountId(this._operatorAcct)
            .execute(this);
    }

    /*
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
    // we're not using symbols because Flow doesn't support computed class properties and it's
    // much nicer to just use `flowgen` rather than maintaining our own redundant definitions files
    public _randomNode(): Node {
        return this._nodes[ Math.floor(Math.random() * this._nodes.length) ];
    }

    /*
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
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

    /*
     * NOT A STABLE API
     *
     * This method is public for access by other classes in the SDK but is not intended to be
     * part of the stable/public API. Usage may be broken in releases with backwards-compatible
     * version bumps.
     */
    public abstract _unaryCall<Rq extends ProtobufMessage, Rs extends ProtobufMessage>(
        url: string, request: Rq, method: UnaryMethodDefinition<Rq, Rs>): Promise<Rs>;
}
