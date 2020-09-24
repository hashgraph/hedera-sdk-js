import proto from "@hashgraph/proto";
import AccountId from "./account/AccountId";
import Hbar from "./Hbar";
import TransactionResponse from "./TransactionResponse";
import TransactionId from "./TransactionId";
import HederaExecutable from "./HederaExecutable";
import Status from "./Status";
import { PrivateKey, PublicKey } from "@hashgraph/cryptography";
import Long from "long";
import { hash as sha3_384 } from "@stablelib/sha384";

export const DEFAULT_AUTO_RENEW_PERIOD = Long.fromValue(7776000); // 90 days (in seconds)

export const DEFAULT_RECORD_THRESHOLD = Hbar.fromTinybars(
    Long.fromString("9223372036854775807")
);

const DEFAULT_TRANSACTION_VALID_DURATION = 120; // seconds

/**
 * @type {Map<proto.TransactionBody["data"], (body: proto.TransactionBody) => Transaction>}
 */
export const TRANSACTION_REGISTRY = new Map();

/**
 * Base class for all transactions that may be submitted to Hedera.
 *
 * @abstract
 * @augments {HederaExecutable<proto.ITransaction, proto.ITransactionResponse, TransactionResponse>}
 */
export default class Transaction extends HederaExecutable {
    // A SDK transaction is composed of multiple, raw protobuf transactions.
    // These should be functionally identicasl, with the exception of pointing to
    // different nodes.

    // When retrying a transaction after a network error or retry-able
    // status response, we try a different transaction and thus a different node.

    constructor() {
        super();

        /**
         * @internal
         * @type {proto.ITransaction[]}
         */
        this._transactions = [];

        /**
         * @private
         * @type {Set<string>}
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
     * @param {Uint8Array} bytes
     * @returns {Transaction}
     */
    static fromBytes(bytes) {
        const transaction = proto.Transaction.decode(bytes);
        const isFrozen =
            transaction.sigMap != null
                ? transaction.sigMap.sigPair != null
                    ? transaction.sigMap.sigPair.length
                    : 0
                : 0 > 0;
        const body = proto.TransactionBody.decode(transaction.bodyBytes);

        if (body.data == null) {
            throw new Error("body.data was not set in the protobuf");
        }

        const fromProtobuf = TRANSACTION_REGISTRY.get(body.data);

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Transaction.fromBytes() not implemented for type ${
                    body.data != null ? body.data : ""
                }`
            );
        }

        const instance = fromProtobuf(body);

        if (isFrozen) {
            // FIXME: convert this to JS
            // instance.signatures = Collections.singletonList(tx.getSigMap().toBuilder());
            instance._transactions = [transaction];
        }

        return instance;
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
        return this.signWith(privateKey.getPublicKey(), (message) =>
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
        const publicKeyString = publicKey.toString();

        if (this._signers.has(publicKeyString)) {
            // this public key has already signed this transaction
            return this;
        }

        for (const transaction of this._transactions) {
            const message = /** @type {Uint8Array} */ (transaction.bodyBytes);
            const signature = await transactionSigner(message);

            if (
                transaction.sigMap != null &&
                transaction.sigMap.sigPair != null
            ) {
                transaction.sigMap.sigPair.push({
                    pubKeyPrefix: publicKeyData,
                    ed25519: signature,
                });
            }
        }

        this._signers.add(publicKeyString);

        return this;
    }

    /**
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {Promise<this>}
     */
    signWithOperator(client) {
        const operator = client._operator;

        if (operator == null) {
            throw new Error(
                "`client` must have an operator to sign with the operator"
            );
        }

        if (!this._isFrozen()) {
            this.freezeWith(client);
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
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT> | null} client
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
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.Transaction.encode(this._transactions[0]).finish();
    }

    /**
     * @returns {Uint8Array}
     */
    getTransactionHash() {
        if (!this._isFrozen()) {
            throw new Error(
                "transaction must have been frozen before calculating the hash will be stable, try calling `freeze`"
            );
        }

        if (this._transactions.length != 1) {
            throw new Error(
                "transaction must have an explicit node ID set, try calling `setNodeId`"
            );
        }

        return hash(proto.Transaction.encode(this._makeRequest()).finish());
    }

    /**
     * @protected
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {Promise<void>}
     */
    async _onExecute(client) {
        if (!this._isFrozen()) {
            this.freezeWith(client);
        }

        // on execute, sign each transaction with the operator, if present
        // and we are signing a transaction that used the default transaction ID

        const transactionId = /** @type {TransactionId} */ (this
            ._transactionId);
        const operatorId = client.getOperatorId();

        if (operatorId != null && operatorId.equals(transactionId.accountId)) {
            await this.signWithOperator(client);
        }
    }

    /**
     * @internal
     * @override
     * @returns {proto.ITransaction}
     */
    _makeRequest() {
        return this._transactions[this._nextTransactionIndex];
    }

    /**
     * @abstract
     * @protected
     * @param {proto.ITransactionResponse} response
     * @returns {Status}
     */
    _mapResponseStatus(response) {
        return Status._fromCode(
            /** @type {proto.ResponseCodeEnum} */
            (response.nodeTransactionPrecheckCode)
        );
    }

    /**
     * @abstract
     * @protected
     * @param {proto.ITransactionResponse} _
     * @param {AccountId} nodeId
     * @param {proto.ITransaction} request
     * @returns {TransactionResponse}
     */
    _mapResponse(_, nodeId, request) {
        return new TransactionResponse({
            nodeId,
            transactionHash: hash(proto.Transaction.encode(request).finish()),
            transactionId: /** @type {TransactionId} */ (this._transactionId),
        });
    }

    /**
     * @abstract
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {AccountId}
     */
    _getNodeId(client) {
        const node = this.getNodeId();
        return node != null ? node : client._getNextNodeId();
    }

    /**
     * @abstract
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        // each time buildNext is called we move our cursor to the next transaction
        // wrapping around to ensure we are cycling
        this._nextTransactionIndex =
            (this._nextTransactionIndex + 1) % this._transactions.length;
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
            sigMap: {
                sigPair: [],
            },
            bodyBytes,
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
            transactionFee:
                this._maxTransactionFee != null
                    ? this._maxTransactionFee.toTinybars()
                    : null,
            memo: this._transactionMemo,
            transactionID:
                this._transactionId != null
                    ? this._transactionId._toProtobuf()
                    : null,
            nodeAccountID: nodeId._toProtobuf(),
            transactionValidDuration: {
                seconds: this._transactionValidDuration,
            },
        };
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

/**
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function hash(bytes) {
    return new Uint8Array(sha3_384(bytes));
}
