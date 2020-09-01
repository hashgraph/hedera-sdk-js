import AccountId from "./account/AccountId";
import Time from "./Time";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * Normalized transaction ID returned by various methods in the SDK.
 *
 * The ID for a transaction. This is used for retrieving receipts and records for a transaction,
 * for appending to a file right after creating it, for instantiating a smart contract with
 * bytecode in a file just created, and internally by the network for detecting when duplicate
 * transactions are submitted. A user might get a transaction processed faster by submitting it
 * to N nodes, each with a different node account, but all with the same TransactionID. Then,
 * the transaction will take effect when the first of all those nodes submits the transaction
 * and it reaches consensus. The other transactions will not take effect. So this could make the
 * transaction take effect faster, if any given node might be slow. However, the full transaction
 * fee is charged for each transaction, so the total fee is N times as much if the transaction
 * is sent to N nodes.
 */
export default class TransactionId {
    /**
     * @private
     * @param {object} properties
     * @param {AccountId} properties.accountId
     * @param {Time=} properties.validStart
     */
    constructor(properties) {
        /**
         * The Account ID that paid for this transaction.
         *
         * @type {AccountId}
         */
        this.accountId = properties.accountId;

        /**
         * The transaction is invalid if consensusTimestamp < transactionID.transactionStartValid.
         *
         * @type {Time}
         */
        this.validStart = properties.validStart ?? new Time();
    }

    /**
     * @param {AccountId | string} accountId
     * @param {Time} validStart
     * @returns {TransactionId}
     */
    static withValidStart(accountId, validStart) {
        return new TransactionId({
            accountId:
                typeof accountId === "string"
                    ? AccountId.fromString(accountId)
                    : accountId,
            validStart,
        });
    }

    /**
     * @param {string} id
     * @returns {TransactionId}
     */
    static fromString(id) {
        const [account, time] = id.split("@");
        const [seconds, nanos] = time.split(".");

        return new TransactionId({
            accountId: AccountId.fromString(account),
            validStart: new Time(Number(seconds), Number(nanos)),
        });
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.accountId.toString()}@${this.validStart.seconds}.${
            this.validStart.nanos
        }`;
    }

    /**
     * @param {proto.ITransactionID} id
     * @returns {TransactionId}
     */
    static _fromProtobuf(id) {
        const seconds =
            id.transactionValidStart?.seconds instanceof Long
                ? id.transactionValidStart?.seconds.toInt()
                : id.transactionValidStart?.seconds ?? 0;
        const nanos = id.transactionValidStart?.nanos ?? 0;

        return new TransactionId({
            // @ts-ignore
            accountId: AccountId._fromProtobuf(id.accountID),
            validStart: new Time(seconds, nanos),
        });
    }

    /**
     * @protected
     * @returns {proto.ITransactionID}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            transactionValidStart: this.validStart._toProtobuf(),
        };
    }
}
