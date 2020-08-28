import * as nacl from "tweetnacl";
import Hbar from "./Hbar.js";
import AccountId from "./AccountId.js";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";

/**
 * @typedef {(msg: Uint8Array) => Uint8Array | Promise<Uint8Array>} TransactionSigner
 */

/**
 * @typedef {object} PubKeyAndSigner
 * @property {PublicKey} publicKey
 * @property {TransactionSigner} signer
 */

/**
 * @typedef {string | PrivateKey | PubKeyAndSigner} SigningOpts
 */

/**
 * @typedef {object & SigningOpts} Operator
 * @property {import("./AccountId.js").AccountIdLike} accountId
 */

/**
 * @typedef {Object.<string, import("./AccountId.js").AccountIdLike> | Node[]} Nodes
 */

/**
 * A URL, AccountID pair identifying a Node
 * @typedef {object} Node
 * @property {string} url
 * @property {AccountId} id
 */

export default class BaseClient {
    /**
     * @param {Nodes} network
     * @param {Operator | undefined} operator
     */
    constructor(network, operator) {
        /**
         * @type {Operator}
         */
        this._operator;

        /**
         * @type {Node[]}
         */
        this._nodes;

        /**
         * NOTE: This is a package-private API
         *
         * @type {Hbar}
         */
        this._maxTransactionFee = new Hbar(1);

        /**
         * NOTE: This is a package-private API
         *
         * @type {Hbar}
         */
        this._maxQueryPayment = new Hbar(1);
        this.replaceNodes(network);

        if (operator) {
            if ((
                /**
                 * @type {PrivateKey}
                 */
                operator
            ).privateKey != null) {
                this.setOperator(
                    operator.accountId,
                    (
                        /**
                         * @type {PrivateKey}
                         */
                        operator
                    ).privateKey
                );
            } else {
                /**
                 * @type {PubKeyAndSigner}
                 */
                const signer = operator;
                this.setOperatorWith(
                    operator.accountId,
                    /**
                     * @type {PublicKey}
                     */
                    signer.publicKey,
                    /**
                     * @type {TransactionSigner}
                     */
                    signer.signer
                );
            }
        }
    }

    /**
     * Set the operator for the client object
     *
     * @param {import("./AccountId.js").AccountIdLike} account
     * @param {PrivateKey | string} privateKey
     * @returns {BaseClient}
     */
    setOperator(account, privateKey) {
        const key = typeof privateKey === "string" ?
            PrivateKey.fromString(
                /**
                 * @type {sting}
                 */
                privateKey
            ) :
            /**
             * @type {PrivateKey}
             */
            privateKey;

        this._operatorAccount = new AccountId(account, undefined, undefined);
        this._operatorPublicKey = key.publicKey;
        this._operatorSigner = (
            /**
             * @type {Uint8Array}
             */
            msg
        ) => nacl.sign.detached(msg, key._keyData);

        return this;
    }

    /**
     * @param {import("./AccountId.js").AccountIdLike} account
     * @param {PublicKey} publicKey
     * @param {TransactionSigner} signer
     * @returns {BaseClient}
     */
    setOperatorWith(account, publicKey, signer) {
        this._operatorAccount = new AccountId(account, undefined, undefined);
        this._operatorPublicKey = publicKey;
        this._operatorSigner = signer;

        return this;
    }

    /**
     * @param {Nodes} network
     * @returns {BaseClient}
     */
    replaceNodes(network) {
        this._nodes = Array.isArray(network) ?
            /**
             * @type {Node[]}
             */
            network :
            Object.entries(network)
                .map(([ url, accountId ]) => {
                    const id = new AccountId(accountId, undefined, undefined);
                    return { url, id };
                });

        return this;
    }

    /**
     * @returns {AccountId | undefined}
     */
    getOperatorId() {
        return this._operatorAccount;
    }

    /**
     * @returns {TransactionSigner | undefined}
     */
    _getOperatorSigner() {
        return this._operatorSigner;
    }

    /**
     * @returns {PublicKey | undefined}
     */
    getOperatorKey() {
        return this._operatorPublicKey;
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
     * @param {Hbar} maxFee
     * @returns {BaseClient}
     */
    setMaxTransactionFee(maxFee) {
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
     * @param {Hbar} maxPayment - the maximum automatic payment for a query
     * @returns {BaseClient}
     */
    setMaxQueryPayment(maxPayment) {
        this._maxQueryPayment = maxPayment instanceof Hbar ?
            maxPayment :
            Hbar.fromTinybar(maxPayment);

        return this;
    }

    /**
     * @param {import("./AccountId.js").AccountIdLike} _id
     * @returns {Promise<void>}
     */
    async ping(_id) {
        // await new AccountBalanceQuery()
        //     .setAccountId(id)
        //     .execute(this);
    }

    /**
     * NOT A STABLE API
     *
     * @param {string | AccountId} node
     * @returns {Node}
     */
    _getNode(node) {
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
    /**
     * @template {ProtobufMessage} Rq
     * @template {ProtobufMessage} Rs
     * @param {string} _url
     * @param {Rq} _request
     * @param {UnaryMethodDefinition<Rq, Rs>} _method
     * @returns {Promise<Rs>}
     */
    _unaryCall(_url, _request, _method) {
        throw new Error("(BUG) BaseClient._unaryCall() was not overriden");
    }
}
