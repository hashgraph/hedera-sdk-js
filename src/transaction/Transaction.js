import Hbar from "../Hbar.js";
import TransactionResponse from "./TransactionResponse.js";
import TransactionId from "./TransactionId.js";
import TransactionHashMap from "./TransactionHashMap.js";
import SignatureMap from "./SignatureMap.js";
import Executable from "../Executable.js";
import Status from "../Status.js";
import Long from "long";
import * as sha384 from "../cryptography/sha384.js";
import * as hex from "../encoding/hex.js";
import {
    SignedTransaction as ProtoSignedTransaction,
    TransactionList as ProtoTransactionList,
    TransactionBody as ProtoTransactionBody,
} from "@hashgraph/proto";
import AccountId from "../account/AccountId.js";

/**
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").ITransactionList} proto.ITransactionList
 * @typedef {import("@hashgraph/proto").ITransactionID} proto.ITransactionID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").PrivateKey} PrivateKey
 * @typedef {import("@hashgraph/cryptography").PublicKey} PublicKey
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

export const CHUNK_SIZE = 4096;

/**
 * @type {Map<NonNullable<proto.TransactionBody["data"]>, (transactions: proto.ITransaction[], signedTransactions: proto.ISignedTransaction[], transactionIds: TransactionId[], nodeIds: AccountId[], bodies: proto.TransactionBody[]) => Transaction>}
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
         * @internal
         * @type {proto.ITransaction[]}
         */
        this._transactions = [];

        /**
         * List of proto transactions that have been built from this SDK
         * transaction. Each one should share the same transaction ID.
         *
         * @internal
         * @type {proto.ISignedTransaction[]}
         */
        this._signedTransactions = [];

        /**
         * Set of public keys (as string) who have signed this transaction so
         * we do not allow them to sign it again.
         *
         * @private
         * @type {Set<string>}
         */
        this._signerPublicKeys = new Set();

        /**
         * @protected
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
         * @protected
         * @type {TransactionId[]}
         */
        this._transactionIds = [];
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {Transaction}
     */
    static fromBytes(bytes) {
        const signedTransactions = [];
        const transactionIds = [];
        const nodeIds = [];

        /** @type {string[]} */
        const transactionIdStrings = [];

        /** @type {string[]} */
        const nodeIdStrings = [];

        const bodies = [];

        const list = ProtoTransactionList.decode(bytes).transactionList;

        for (const transaction of list) {
            if (transaction.signedTransactionBytes == null) {
                throw new Error("Transaction.signedTransactionBytes are null");
            }

            const signedTransaction = ProtoSignedTransaction.decode(
                transaction.signedTransactionBytes
            );
            signedTransactions.push(signedTransaction);

            const body = ProtoTransactionBody.decode(
                signedTransaction.bodyBytes
            );

            if (body.data == null) {
                throw new Error("(BUG) body.data was not set in the protobuf");
            }

            bodies.push(body);

            const transactionId = TransactionId._fromProtobuf(
                /** @type {proto.ITransactionID} */ (body.transactionID)
            );

            if (!transactionIdStrings.includes(transactionId.toString())) {
                transactionIds.push(transactionId);
                transactionIdStrings.push(transactionId.toString());
            }

            const nodeAccountId = AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (body.nodeAccountID)
            );

            if (!nodeIdStrings.includes(nodeAccountId.toString())) {
                nodeIds.push(nodeAccountId);
                nodeIdStrings.push(nodeAccountId.toString());
            }
        }

        const body = bodies[0];

        if (body == null || body.data == null) {
            throw new Error(
                "No transaction found in bytes or failed to decode TransactionBody"
            );
        }

        const fromProtobuf = TRANSACTION_REGISTRY.get(body.data);

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Transaction.fromBytes() not implemented for type ${body.data}`
            );
        }

        return fromProtobuf(
            list,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @template {Transaction} TransactionT
     * @param {TransactionT} transaction
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TransactionT}
     */
    static _fromProtobufTransactions(
        transaction,
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];

        transaction._transactions = transactions;
        transaction._signedTransactions = signedTransactions;
        transaction._transactionIds = transactionIds;
        transaction._nodeIds = nodeIds;
        transaction._nextNodeIndex = 0;
        transaction._nextTransactionIndex = 0;
        transaction._transactionValidDuration =
            body.transactionValidDuration != null
                ? /** @type {Long} */ (body.transactionValidDuration
                      .seconds).toInt()
                : DEFAULT_TRANSACTION_VALID_DURATION;
        transaction._maxTransactionFee =
            body.transactionFee != null
                ? Hbar.fromTinybars(body.transactionFee)
                : null;
        transaction._transactionMemo = body.memo != null ? body.memo : "";

        for (let i = 0; i < nodeIds.length; i++) {
            const signedTransaction = signedTransactions[i];
            if (
                signedTransaction.sigMap != null &&
                signedTransaction.sigMap.sigPair != null
            ) {
                for (const sigPair of signedTransaction.sigMap.sigPair) {
                    transaction._signerPublicKeys.add(
                        hex.encode(
                            /** @type {Uint8Array} */ (sigPair.pubKeyPrefix)
                        )
                    );
                }
            }
        }

        return transaction;
    }

    /**
     * @override
     * @param {AccountId[]} nodeIds
     * @returns {this}
     */
    setNodeAccountIds(nodeIds) {
        this._requireNotFrozen();
        super.setNodeAccountIds(nodeIds);
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
     * @param {number | string | Long | BigNumber | Hbar} maxTransactionFee
     * @returns {this}
     */
    setMaxTransactionFee(maxTransactionFee) {
        this._requireNotFrozen();
        this._maxTransactionFee =
            maxTransactionFee instanceof Hbar
                ? maxTransactionFee
                : new Hbar(maxTransactionFee);

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
        if (this._transactionIds.length === 0) {
            throw new Error(
                "transaction must have been frozen before getting the transaction ID, try calling `freeze`"
            );
        }

        return this._transactionIds[this._nextTransactionIndex];
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
        this._transactionIds = [transactionId];

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
        // support that in the protobuf. this means that we would fail
        // to re-inflate [this._signerPublicKeys] during [fromBytes] if we used DER
        // prefixes here
        const publicKeyHex = hex.encode(publicKeyData);

        if (this._signerPublicKeys.has(publicKeyHex)) {
            // this public key has already signed this transaction
            return this;
        }

        this._transactions = [];

        for (const signedTransaction of this._signedTransactions) {
            const bodyBytes = /** @type {Uint8Array} */ (signedTransaction.bodyBytes);
            const signature = await transactionSigner(bodyBytes);

            if (signedTransaction.sigMap == null) {
                signedTransaction.sigMap = {};
            }

            if (signedTransaction.sigMap.sigPair == null) {
                signedTransaction.sigMap.sigPair = [];
            }

            signedTransaction.sigMap.sigPair.push({
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
     * @param {PublicKey} publicKey
     * @param {Uint8Array} signature
     * @returns {this}
     */
    addSignature(publicKey, signature) {
        const publicKeyData = publicKey.toBytes();
        const publicKeyHex = hex.encode(publicKeyData);

        if (this._signerPublicKeys.has(publicKeyHex)) {
            // this public key has already signed this transaction
            return this;
        }

        this._transactions = [];

        for (const transaction of this._signedTransactions) {
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
     * @returns {SignatureMap}
     */
    getSignatures() {
        return SignatureMap._fromTransaction(this);
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

        if (client != null && this._transactionIds.length === 0) {
            const operator = client._operator;

            if (operator == null) {
                throw new Error(
                    "`client` must have an `operator` or `transactionId` must be set"
                );
            }

            this.setTransactionId(TransactionId.generate(operator.accountId));
        }

        if (this._transactionIds.length === 0) {
            throw new Error(
                "`transactionId` must be set or `client` must be provided with `freezeWith`"
            );
        }

        if (this._nodeIds.length > 0) {
            // Do nothing
        } else if (client != null) {
            this._nodeIds = client._network.getNodeAccountIdsForExecute();
        } else {
            throw new Error(
                "`nodeAccountId` must be set or `client` must be provided with `freezeWith`"
            );
        }

        this._signedTransactions = this._nodeIds.map((nodeId) =>
            this._makeSignedTransaction(nodeId)
        );

        return this;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        this._requireFrozen();

        this._buildTransactions(this._signedTransactions.length);

        return ProtoTransactionList.encode({
            transactionList: this._transactions,
        }).finish();
    }

    /**
     * @returns {Promise<Uint8Array>}
     */
    getTransactionHash() {
        this._requireFrozen();

        this._buildTransactions(1);

        return sha384.digest(
            /** @type {Uint8Array} */ (this._transactions[0]
                .signedTransactionBytes)
        );
    }

    /**
     * @returns {Promise<TransactionHashMap>}
     */
    getTransactionHashPerNode() {
        this._requireFrozen();
        this._buildTransactions(this._signedTransactions.length);
        return TransactionHashMap._fromTransaction(this);
    }

    /**
     * @returns {TransactionId}
     */
    _getTransactionId() {
        return this.transactionId;
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
        const index =
            this._nextTransactionIndex * this._nodeIds.length +
            this._nextNodeIndex;
        this._buildTransactions(index + 1);
        return this._transactions[index];
    }

    /**
     * @param {number} untilIndex
     * @private
     */
    _buildTransactions(untilIndex) {
        for (let i = this._transactions.length; i < untilIndex; i++) {
            this._transactions.push({
                signedTransactionBytes: ProtoSignedTransaction.encode(
                    this._signedTransactions[i]
                ).finish(),
            });
        }
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
            /** @type {Uint8Array} */ (request.signedTransactionBytes)
        );
        const transactionId = this.transactionId;

        this._nextTransactionIndex =
            (this._nextTransactionIndex + 1) % this._transactionIds.length;

        return new TransactionResponse({
            nodeId,
            transactionHash,
            transactionId,
        });
    }

    /**
     * @override
     * @returns {AccountId}
     */
    _getNodeAccountId() {
        if (this._nodeIds.length === 0) {
            throw new Error(
                "(BUG) Transaction::_getNodeAccountId called before transaction has been frozen"
            );
        }

        return this._nodeIds[this._nextNodeIndex % this._nodeIds.length];
    }

    /**
     * @internal
     * @param {?AccountId} nodeId
     * @returns {proto.ISignedTransaction}
     */
    _makeSignedTransaction(nodeId) {
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
                this._transactionIds[this._nextTransactionIndex] != null
                    ? this._transactionIds[
                          this._nextTransactionIndex
                      ]._toProtobuf()
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
        return this._signedTransactions.length > 0;
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
    _requireFrozen() {
        if (!this._isFrozen()) {
            throw new Error(
                "transaction must have been frozen before calculating the hash will be stable, try calling `freeze`"
            );
        }
    }
}
