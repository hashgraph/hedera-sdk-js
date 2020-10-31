import Hbar from "../Hbar.js";
import TransactionResponse from "./TransactionResponse.js";
import TransactionId from "./TransactionId.js";
import Executable from "../Executable.js";
import Status from "../Status.js";
import Long from "long";
import * as sha384 from "../cryptography/sha384.js";
import * as hex from "../encoding/hex.js";
import {
    Transaction as ProtoTransaction,
    TransactionBody as ProtoTransactionBody,
} from "@hashgraph/proto";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").PrivateKey} PrivateKey
 * @typedef {import("@hashgraph/cryptography").PublicKey} PublicKey
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../channel/Channel.js").default} Channel
 */

// 90 days (in seconds)
export const DEFAULT_AUTO_RENEW_PERIOD = Long.fromValue(7776000);

// maximum value of i64 (so there is never a record generated)
export const DEFAULT_RECORD_THRESHOLD = Hbar.fromTinybars(
    Long.fromString("9223372036854775807")
);

// 120 seconds
const DEFAULT_TRANSACTION_VALID_DURATION = 120;

/**
 * @type {Map<proto.TransactionBody["data"], (body: proto.TransactionBody) => Transaction>}
 */
export const TRANSACTION_REGISTRY = new Map();

/**
 * Base class for all transactions that may be submitted to Hedera.
 *
 * @abstract
 * @augments {Executable<proto.ITransaction, proto.ITransactionResponse, TransactionResponse>}
 */
export default class Transaction extends Executable {
    // A SDK transaction is composed of multiple, raw protobuf transactions.
    // These should be functionally identicasl, with the exception of pointing to
    // different nodes.

    // When retrying a transaction after a network error or retry-able
    // status response, we try a different transaction and thus a different node.

    constructor() {
        super();

        /**
         * List of proto transactions that have been built from this SDK
         * transaction. Each one should share the same transaction ID.
         *
         * @private
         * @type {proto.ITransaction[]}
         */
        this._transactions = [];

        /**
         * Set of public keys (as string) who have signed this transaction so
         * we do not allow them to sign it again.
         *
         * @private
         * @type {Set<string>}
         */
        this._signerPublicKeys = new Set();

        /**
         * List of node account IDs for each transaction that has been
         * built.
         *
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
        this._nextIndex = 0;

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
        const transaction = ProtoTransaction.decode(bytes);

        const signaturePairs =
            transaction.sigMap != null ? transaction.sigMap.sigPair : null;

        // if a transaction is frozen we need to propagate that state
        const isFrozen = signaturePairs != null && signaturePairs.length > 0;

        const body = ProtoTransactionBody.decode(transaction.bodyBytes);

        if (body.data == null) {
            throw new Error("(BUG) body.data was not set in the protobuf");
        }

        const fromProtobuf = TRANSACTION_REGISTRY.get(body.data);

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Transaction.fromBytes() not implemented for type ${body.data}`
            );
        }

        const instance = fromProtobuf(body);

        if (isFrozen) {
            instance._transactions = [transaction];

            // collate those that have signed the transaction
            // this is so that we don't allow someone to sign more than once
            if (signaturePairs != null) {
                for (const signaturePair of signaturePairs) {
                    if (signaturePair.pubKeyPrefix == null) continue;

                    instance._signerPublicKeys.add(
                        hex.encode(signaturePair.pubKeyPrefix)
                    );
                }
            }
        }

        return instance;
    }

    /**
     * @override
     * @returns {TransactionId}
     */
    _getTransactionId() {
        if (this._transactionId == null) {
            throw new Error(
                "Attemping to get `TransactionId` before it field was set"
            );
        }

        return this._transactionId;
    }

    /**
     * @returns {AccountId[]}
     */
    get nodeAccountIds() {
        return this._nodeIds;
    }

    /**
     * @param {AccountId[]} nodeIds
     * @returns {this}
     */
    setNodeAccountIds(nodeIds) {
        this._requireNotFrozen();
        this._nodeIds = nodeIds;

        return this;
    }

    /**
     * @returns {number}
     */
    get transactionValidDuration() {
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
    get maxTransactionFee() {
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
    get transactionMemo() {
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
    get transactionId() {
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

        // note: this omits the DER prefix on purpose because Hedera doesn't
        // support that in the protobuf. this means that we woudl fail
        // to re-inflate [this._signerPublicKeys] during [fromBytes] if we used DER
        // prefixes here
        const publicKeyHex = hex.encode(publicKeyData);

        if (this._signerPublicKeys.has(publicKeyHex)) {
            // this public key has already signed this transaction
            return this;
        }

        for (const transaction of this._transactions) {
            const message = /** @type {Uint8Array} */ (transaction.bodyBytes);
            const signature = await transactionSigner(message);

            if (transaction.sigMap == null) {
                transaction.sigMap = {};
            }

            if (transaction.sigMap.sigPair == null) {
                transaction.sigMap.sigPair = [];
            }

            transaction.sigMap.sigPair.push({
                pubKeyPrefix: publicKeyData,
                ed25519: signature,
            });
        }

        this._signerPublicKeys.add(publicKeyHex);

        return this;
    }

    /**
     * @param {import("../client/Client.js").default<Channel, *>} client
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
     * @param {?import("../client/Client.js").default<Channel, *>} client
     * @returns {this}
     */
    freezeWith(client) {
        if (client != null && this._maxTransactionFee == null) {
            this._maxTransactionFee = client.maxTransactionFee;
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
                "`transactionId` must be set or `client` must be provided with `freezeWith`"
            );
        }

        if (this._nodeIds.length > 0) {
            // Do nothing
        } else if (client != null) {
            this._nodeIds = client._getNodeAccountIdsForExecute();
        } else {
            throw new Error(
                "`nodeAccountId` must be set or `client` must be provided with `freezeWith`"
            );
        }

        this._transactions = this._nodeIds.map((nodeId) =>
            this._makeTransaction(nodeId)
        );

        return this;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        let tx;

        // return a partial transaction _or_ return exactly one
        // frozen transaction

        if (!this._isFrozen()) {
            tx = this._makeTransaction(null);
        } else {
            this._requireExactlyOneFrozen();

            tx = this._transactions[0];
        }

        return ProtoTransaction.encode(tx).finish();
    }

    /**
     * @returns {Promise<Uint8Array>}
     */
    get transactionHash() {
        this._requireExactlyOneFrozen();

        return sha384.digest(
            ProtoTransaction.encode(this._makeRequest()).finish()
        );
    }

    /**
     * @override
     * @protected
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (!this._isFrozen()) {
            this.freezeWith(client);
        }

        // on execute, sign each transaction with the operator, if present
        // and we are signing a transaction that used the default transaction ID

        const transactionId = this.transactionId;
        const operatorAccountId = client.operatorAccountId;

        if (
            operatorAccountId != null &&
            operatorAccountId.equals(transactionId.accountId)
        ) {
            await this.signWithOperator(client);
        }
    }

    /**
     * @override
     * @internal
     * @returns {proto.ITransaction}
     */
    _makeRequest() {
        return this._transactions[this._nextIndex];
    }

    /**
     * @override
     * @internal
     * @param {proto.ITransactionResponse} response
     * @returns {Status}
     */
    _mapResponseStatus(response) {
        const { nodeTransactionPrecheckCode } = response;

        return nodeTransactionPrecheckCode == null
            ? Status.Ok
            : Status._fromCode(nodeTransactionPrecheckCode);
    }

    /**
     * @override
     * @protected
     * @param {proto.ITransactionResponse} response
     * @param {AccountId} nodeId
     * @param {proto.ITransaction} request
     * @returns {Promise<TransactionResponse>}
     */
    async _mapResponse(response, nodeId, request) {
        const transactionHash = await sha384.digest(
            ProtoTransaction.encode(request).finish()
        );

        return new TransactionResponse({
            nodeId,
            transactionHash,
            transactionId: this.transactionId,
        });
    }

    /**
     * @override
     * @template ChannelT
     * @template MirrorChannelT
     * @param {?import("../client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @returns {AccountId}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getNodeAccountId(client) {
        if (this.nodeAccountIds.length == 0) {
            throw new Error(
                "(BUG) Transaction::_getNodeAccountId called before transaction has been frozen"
            );
        }

        return this.nodeAccountIds[this._nextIndex];
    }

    /**
     * @override
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        // each time we move our cursor to the next transaction
        // wrapping around to ensure we are cycling
        this._nextIndex = (this._nextIndex + 1) % this._transactions.length;
    }

    /**
     * @internal
     * @param {?AccountId} nodeId
     * @returns {proto.ITransaction}
     */
    _makeTransaction(nodeId) {
        const body = this._makeTransactionBody(nodeId);
        const bodyBytes = ProtoTransactionBody.encode(body).finish();

        return {
            bodyBytes,
            sigMap: {
                sigPair: [],
            },
        };
    }

    /**
     * @private
     * @param {?AccountId} nodeId
     * @returns {proto.ITransactionBody}
     */
    _makeTransactionBody(nodeId) {
        return {
            [this._getTransactionDataCase()]: this._makeTransactionData(),
            transactionFee:
                this._maxTransactionFee != null
                    ? this._maxTransactionFee.toTinybars()
                    : null,
            memo: this._transactionMemo,
            transactionID:
                this._transactionId != null
                    ? this._transactionId._toProtobuf()
                    : null,
            nodeAccountID: nodeId != null ? nodeId._toProtobuf() : null,
            transactionValidDuration: {
                seconds: Long.fromNumber(this._transactionValidDuration),
            },
        };
    }

    /**
     * @abstract
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
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

    /**
     * @private
     */
    _requireExactlyOneFrozen() {
        if (!this._isFrozen()) {
            throw new Error(
                "transaction must have been frozen before calculating the hash will be stable, try calling `freeze`"
            );
        }

        if (this._transactions.length !== 1) {
            throw new Error(
                "transaction must have an explicit node ID set, try calling `setNodeAccountIds`"
            );
        }
    }
}
