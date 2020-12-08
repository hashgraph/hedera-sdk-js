import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IFreezeTransactionBody} proto.IFreezeTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * @typedef {object} HourMinute
 * @property {number} hour
 * @property {number} minute
 */

export default class FreezeTransaction extends Transaction {
    /**
     * @param {Object} [props]
     * @param {HourMinute} [props.startTime]
     * @param {HourMinute} [props.endTime]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?HourMinute}
         */
        this._startTime = null;

        /**
         * @private
         * @type {?HourMinute}
         */
        this._endTime = null;

        if (props.startTime != null) {
            this.setStartTime(props.startTime.hour, props.startTime.minute);
        }

        if (props.endTime != null) {
            this.setEndTime(props.endTime.hour, props.endTime.minute);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {FreezeTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const freeze = /** @type {proto.IFreezeTransactionBody} */ (body.freeze);

        return Transaction._fromProtobufTransactions(
            new FreezeTransaction({
                startTime:
                    freeze.startHour != null && freeze.startMin != null
                        ? {
                              hour: freeze.startHour,
                              minute: freeze.startMin,
                          }
                        : undefined,
                endTime:
                    freeze.endHour != null && freeze.endMin != null
                        ? {
                              hour: freeze.endHour,
                              minute: freeze.endMin,
                          }
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?HourMinute}
     */
    get startTime() {
        return this._startTime;
    }

    /**
     * @param {number | string} startHourOrString
     * @param {?number} startMinute
     * @returns {FreezeTransaction}
     */
    setStartTime(startHourOrString, startMinute) {
        this._requireNotFrozen();
        if (typeof startHourOrString === "string") {
            const split = startHourOrString.split(":");
            this._startTime = {
                hour: Number(split[0]),
                minute: Number(split[1]),
            };
        } else {
            this._startTime = {
                hour: startHourOrString,
                minute: /** @type {number} */ (startMinute),
            };
        }

        return this;
    }

    /**
     * @returns {?HourMinute}
     */
    get endTime() {
        return this._endTime;
    }

    /**
     * @param {number | string} endHourOrString
     * @param {?number} endMinute
     * @returns {FreezeTransaction}
     */
    setEndTime(endHourOrString, endMinute) {
        this._requireNotFrozen();
        if (typeof endHourOrString === "string") {
            const split = endHourOrString.split(":");
            this._endTime = {
                hour: Number(split[0]),
                minute: Number(split[1]),
            };
        } else {
            this._endTime = {
                hour: endHourOrString,
                minute: /** @type {number} */ (endMinute),
            };
        }

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.ITransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.freeze.freeze(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "freeze";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IFreezeTransactionBody}
     */
    _makeTransactionData() {
        return {
            startHour: this._startTime != null ? this._startTime.hour : null,
            startMin: this._startTime != null ? this._startTime.minute : null,
            endHour: this._endTime != null ? this._endTime.hour : null,
            endMin: this._endTime != null ? this._endTime.minute : null,
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
TRANSACTION_REGISTRY.set("freeze", FreezeTransaction._fromProtobuf);
