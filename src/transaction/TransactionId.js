import AccountId from "../account/AccountId.js";
import Timestamp from "../Timestamp.js";
import * as proto from "@hashgraph/proto";
import * as hex from "../encoding/hex.js";

/**
 * The client-generated ID for a transaction.
 *
 * This is used for retrieving receipts and records for a transaction, for appending to a file
 * right after creating it, for instantiating a smart contract with bytecode in a file just created,
 * and internally by the network for detecting when duplicate transactions are submitted.
 */
export default class TransactionId {
    /**
     * Don't use this method directly.
     * Use `TransactionId.[generate|withNonce|withValidStart]()` instead.
     *
     * @param {?AccountId} accountId
     * @param {?Timestamp} validStart
     * @param {?Uint8Array} nonce
     * @param {?boolean} scheduled
     */
    constructor(accountId, validStart, nonce = null, scheduled = false) {
        /**
         * The Account ID that paid for this transaction.
         *
         * @readonly
         */
        this.accountId = accountId;

        /**
         * The time from when this transaction is valid.
         *
         * When a transaction is submitted there is additionally a validDuration (defaults to 120s)
         * and together they define a time window that a transaction may be processed in.
         *
         * @readonly
         */
        this.validStart = validStart;

        this.nonce = nonce;

        this.scheduled = scheduled;

        Object.freeze(this);
    }

    /**
     * @param {Uint8Array} nonce
     * @returns {TransactionId}
     */
    static withNonce(nonce) {
        return new TransactionId(null, null, nonce, null);
    }

    /**
     * @param {AccountId} accountId
     * @param {Timestamp} validStart
     * @returns {TransactionId}
     */
    static withValidStart(accountId, validStart) {
        return new TransactionId(accountId, validStart, null, null);
    }

    /**
     * Generates a new transaction ID for the given account ID.
     *
     * Note that transaction IDs are made of the valid start of the transaction and the account
     * that will be charged the transaction fees for the transaction.
     *
     * @param {AccountId | string} id
     * @returns {TransactionId}
     */
    static generate(id) {
        return new TransactionId(
            typeof id === "string" ? AccountId.fromString(id) : id,
            Timestamp.generate()
        );
    }

    /**
     * @param {string} id
     * @returns {TransactionId}
     */
    static fromString(id) {
        let [idOrNonce, scheduled] = id.split("?");

        try {
            const nonce = hex.decode(idOrNonce);

            return new TransactionId(
                null,
                null,
                nonce,
                scheduled === "scheduled"
            );
        } catch {
            const [account, time] = id.split("@");
            const [seconds, nanos] = time.split(".").map(Number);

            return new TransactionId(
                AccountId.fromString(account),
                new Timestamp(seconds, nanos),
                null,
                scheduled === "scheduled"
            );
        }
    }

    /**
     * @param {boolean} scheduled
     * @returns {this}
     */
    setScheduled(scheduled) {
        this.scheduled = scheduled;
        return this;
    }

    /**
     * @returns {string}
     */
    toString() {
        if (this.accountId != null && this.validStart != null) {
            return `${this.accountId.toString()}@${this.validStart.seconds.toInt()}.${this.validStart.nanos.toInt()}${
                this.scheduled ? "?scheduled" : ""
            }`;
        } else if (this.nonce != null) {
            return `${hex.encode(this.nonce)}${
                this.scheduled ? "?scheduled" : ""
            }`;
        } else {
            throw new Error(
                "Neither `nonce` or `accountId` and `validStart` are set"
            );
        }
    }

    /**
     * @internal
     * @param {proto.ITransactionID} id
     * @returns {TransactionId}
     */
    static _fromProtobuf(id) {
        if (id.accountID != null && id.transactionValidStart != null) {
            return new TransactionId(
                AccountId._fromProtobuf(id.accountID),
                Timestamp._fromProtobuf(id.transactionValidStart),
                null,
                id.scheduled
            );
        } else if (id.nonce != null) {
            return new TransactionId(null, null, id.nonce, id.scheduled);
        } else {
            throw new Error(
                "Neither `nonce` or `accountID` and `transactionValidStart` are set"
            );
        }
    }

    /**
     * @internal
     * @returns {proto.ITransactionID}
     */
    _toProtobuf() {
        return {
            accountID:
                this.accountId != null ? this.accountId._toProtobuf() : null,
            transactionValidStart:
                this.validStart != null ? this.validStart._toProtobuf() : null,
            nonce: this.nonce != null ? this.nonce : null,
            scheduled: this.scheduled,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionId}
     */
    static fromBytes(bytes) {
        return TransactionId._fromProtobuf(proto.TransactionID.decode(bytes));
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TransactionID.encode(this._toProtobuf()).finish();
    }
}
