import proto from "@hashgraph/proto";
import AccountId from "./account/AccountId";
import Hbar from "./Hbar";
import TransactionResponse from "./TransactionResponse";
import TransactionId from "./TransactionId";
import Client from "./Client";
import Channel from "./Channel";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";

export const DEFAULT_AUTO_RENEW_PERIOD = 7776000; // 90 days (in seconds)

const DEFAULT_TRANSACTION_VALID_DURATION = 120; // seconds

// TODO: toBytes()
// TODO: fromBytes()
// TODO: getTransactionHash()

/**
 * Base class for all transactions that may be submitted to Hedera.
 *
 * @abstract
 */
export default class Transaction {
    // A SDK transaction is composed of multiple, raw protobuf transactions.
    // These should be functionally identicasl, with the exception of pointing to
    // different nodes.

    // When retrying a transaction after a network error or retry-able
    // status response, we try a different transaction and thus a different node.

    constructor() {
        /**
         * @private
         * @type {proto.ITransaction[]}
         */
        this._transactions = [];

        /**
         * @private
         * @type {Set<Uint8Array>}
         */
        this._signers = new Set();

        /**
         * @private
         * @type {AccountId[]}
         */
        this._nodeIds = [];

        /**
         * The index of the next transaction to be executed.
         *
         * @private
         * @type {number}
         */
        this._nextTransactionIndex = 0;

        /**
         * @private
         * @type {number}
         */
        this._transactionValidDuration = DEFAULT_TRANSACTION_VALID_DURATION;

        /**
         * @private
         * @type {?Hbar}
         */
        this._maxTransactionFee = null;

        /**
         * @private
         * @type {string}
         */
        this._transactionMemo = "";

        /**
         * @private
         * @type {?TransactionId}
         */
        this._transactionId = null;
    }

    /**
     * @returns {?AccountId}
     */
    getNodeId() {
        if (this._nodeIds.length > 0) {
            return this._nodeIds[this._nextTransactionIndex];
        }

        return null;
    }

    /**
     * Set the account ID of the node that this transaction will be
     * exclusively submitted to.
     *
     * @param {AccountId} nodeId
     * @returns {this}
     */
    setNodeId(nodeId) {
        this._requireNotFrozen();
        this._nodeIds = [nodeId];

        return this;
    }

    /**
     * @returns {number}
     */
    getTransactionValidDuration() {
        return this._transactionValidDuration;
    }

    /**
     * Sets the duration (in seconds) that this transaction is valid for.
     *
     * This is defaulted to 120 seconds (from the time its executed).
     *
     * @param {number} validDuration
     * @returns {this}
     */
    setTransactionValidDuration(validDuration) {
        this._requireNotFrozen();
        this._transactionValidDuration = validDuration;

        return this;
    }

    /**
     * @returns {?Hbar}
     */
    getMaxTransactionFee() {
        return this._maxTransactionFee;
    }

    /**
     * Set the maximum transaction fee the operator (paying account)
     * is willing to pay.
     *
     * @param {Hbar} maxTransactionFee
     * @returns {this}
     */
    setMaxTransactionFee(maxTransactionFee) {
        this._requireNotFrozen();
        this._maxTransactionFee = maxTransactionFee;

        return this;
    }

    /**
     * @returns {string}
     */
    getTransactionMemo() {
        return this._transactionMemo;
    }

    /**
     * Set a note or description to be recorded in the transaction
     * record (maximum length of 100 bytes).
     *
     * @param {string} transactionMemo
     * @returns {this}
     */
    setTransactionMemo(transactionMemo) {
        this._requireNotFrozen();
        this._transactionMemo = transactionMemo;

        return this;
    }

    /**
     * @returns {TransactionId}
     */
    getTransactionId() {
        if (this._transactionId == null) {
            throw new Error(
                "transaction must have been frozen before getting the transaction ID, try calling `freeze`"
            );
        }

        return this._transactionId;
    }

    /**
     * Set the ID for this transaction.
     *
     * The transaction ID includes the operator's account ( the account paying the transaction
     * fee). If two transactions have the same transaction ID, they won't both have an effect. One
     * will complete normally and the other will fail with a duplicate transaction status.
     *
     * Normally, you should not use this method. Just before a transaction is executed, a
     * transaction ID will be generated from the operator on the client.
     *
     * @param {TransactionId} transactionId
     * @returns {this}
     */
    setTransactionId(transactionId) {
        this._requireNotFrozen();
        this._transactionId = transactionId;

        return this;
    }

    /**
     * @param {PrivateKey} privateKey
     * @returns {Promise<this>}
     */
    sign(privateKey) {
        // FIXME: .getPublicKey()
        return this.signWith(privateKey.publicKey, (message) =>
            Promise.resolve(privateKey.sign(message))
        );
    }

    /**
     * @param {PublicKey} publicKey
     * @param {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
     * @returns {Promise<this>}
     */
    async signWith(publicKey, transactionSigner) {
        const publicKeyData = publicKey.toBytes();

        if (this._signers.has(publicKeyData)) {
            // this public key has already signed this transaction
            return this;
        }

        for (const transaction of this._transactions) {
            const message = /** @type {Uint8Array} */ (transaction.bodyBytes);
            const signature = await transactionSigner(message);

            transaction.sigMap?.sigPair?.push({
                pubKeyPrefix: publicKeyData,
                ed25519: signature,
            });
        }

        this._signers.add(publicKeyData);

        return this;
    }

    /**
     * @param {Client} client
     * @returns {Promise<this>}
     */
    signWithOperator(client) {
        const operator = client._operator;

        if (operator == null) {
            throw new Error("`client` must have an operator to sign with the operator");
        }

        return this.signWith(operator.publicKey, operator.transactionSigner);
    }

    /**
     * Freeze this transaction from future modification to prepare for
     * signing or serialization.
     *
     * @returns {this}
     */
    freeze() {
        return this.freezeWith(null);
    }

    /**
     * Freeze this transaction from further modification to prepare for
     * signing or serialization.
     *
     * Will use the `Client`, if available, to generate a default Transaction ID and select 1/3
     * nodes to prepare this transaction for.
     *
     * @param {Client | null} client
     * @returns {this}
     */
    freezeWith(client) {
        if (client != null && this._maxTransactionFee == null) {
            this._maxTransactionFee = client._maxTransactionFee;
        }

        if (client != null && this._transactionId == null) {
            const operator = client._operator;

            if (operator == null) {
                throw new Error(
                    "`client` must have an `operator` or `transactionId` must be set"
                );
            }

            this.setTransactionId(TransactionId.generate(operator.accountId));
        }

        if (this._transactionId == null) {
            throw new Error(
                "`client` must be provided or `transactionId` must be set"
            );
        }

        if (this._nodeIds.length > 0) {
            // the node IDs have been pre-selected
            this._transactions = this._nodeIds.map((nodeId) =>
                this._makeTransaction(nodeId)
            );
        } else if (client != null) {
            // pick N / 3 nodes from the client and build that many transactions
            // this is for fail-over so we can cycle through nodes
            const numNodes = client._getNumberOfNodesForTransaction();

            for (let index = 0; index < numNodes; index += 1) {
                const nodeId = client._getNextNodeId();

                this._nodeIds.push(nodeId);
                this._transactions.push(this._makeTransaction(nodeId));
            }
        } else {
            throw new Error(
                "`client` must be provided or `nodeId` must be set"
            );
        }

        return this;
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client) {
        if (!this._isFrozen()) {
            this.freezeWith(client);
        }

        // on execute, sign each transaction with the operator, if present
        // and we are signing a transaction that used the default transaction ID

        const transactionId = /** @type {TransactionId} */ (this._transactionId);
        const operatorId = client.getOperatorId();

        if (operatorId != null && operatorId.equals(transactionId.accountId)) {
            await this.signWithOperator(client);
        }

        // TODO: Add retries

        const request = this._makeRequest();

        const nodeId = /** @type {AccountId} */ (this.getNodeId());

        const channel = client._getNetworkChannel(nodeId);

        const method = this._getTransactionMethod(channel);

        const response = await method(request);

        console.log("nodeTransactionPrecheckCode >", response.nodeTransactionPrecheckCode);

        return new TransactionResponse({
            nodeId,
            transactionHash: Uint8Array.of(),
            transactionId
        });
    }

    /**
     * @private
     * @returns {proto.ITransaction}
     */
    _makeRequest() {
        return this._transactions[this._nextTransactionIndex];
    }

    /**
     * @private
     * @param {AccountId} nodeId
     * @returns {proto.ITransaction}
     */
    _makeTransaction(nodeId) {
        const body = this._makeTransactionBody(nodeId);
        const bodyBytes = proto.TransactionBody.encode(body).finish();

        return {
            bodyBytes,
            sigMap: {
                sigPair: [],
            },
        };
    }

    /**
     * @private
     * @param {AccountId} nodeId
     * @returns {proto.ITransactionBody}
     */
    _makeTransactionBody(nodeId) {
        /** @assert {this._transactionId != null} */

        /** @type {string} */
        // @ts-ignore
        const dataCase = this._getTransactionDataCase();

        return {
            [dataCase]: this._makeTransactionData(),
            transactionFee: this._maxTransactionFee?.toTinybars(),
            memo: this._transactionMemo,
            transactionID: this._transactionId?._toProtobuf(),
            nodeAccountID: nodeId._toProtobuf(),
            transactionValidDuration: {
                seconds: this._transactionValidDuration,
            },
        };
    }

    /**
     * @abstract
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    // @ts-ignore
    _getTransactionMethod(channel) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {object}
     */
    _makeTransactionData() {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _isFrozen() {
        return this._transactions.length > 0;
    }

    /**
     * @protected
     */
    _requireNotFrozen() {
        if (this._isFrozen()) {
            throw new Error(
                "transaction is immutable; it has at least one signature or has been explicitly frozen"
            );
        }
    }
}
