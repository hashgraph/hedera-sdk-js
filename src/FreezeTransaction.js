import proto from "@hashgraph/proto";
import Channel from "./channel/Channel";
import Transaction, { TRANSACTION_REGISTRY } from "./Transaction";

/**
 * @typedef {object} Time
 * @property {number} hour
 * @property {number} min
 */

export default class FreezeTransaction extends Transaction {
    /**
     * @param {Object} props
     * @param {Time} [props.startTime]
     * @param {Time} [props.endTime]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Time}
         */
        this._startTime = null;

        /**
         * @private
         * @type {?Time}
         */
        this._endTime = null;

        if (props.startTime != null) {
            this.setStartTime(props.startTime);
        }

        if (props.endTime != null) {
            this.setEndTime(props.endTime);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {FreezeTransaction}
     */
    static _fromProtobuf(body) {
        const freeze = /** @type {proto.IFreezeTransactionBody} */ (body.freeze);

        return new FreezeTransaction({
            startTime:
                (freeze.startHour != null && freeze.startMin != null)
                    ? {
                          hour: freeze.startHour,
                          min: freeze.startMin,
                      }
                    : undefined,
            endTime:
                (freeze.endHour != null && freeze.endMin != null)
                    ? {
                          hour: freeze.endHour,
                          min: freeze.endMin,
                      }
                    : undefined,
        });
    }

    /**
     * @returns {?Time}
     */
    getStartTime() {
        return this._startTime;
    }

    /**
     * @param {Time} startTime
     * @returns {FreezeTransaction}
     */
    setStartTime(startTime) {
        this._requireNotFrozen();
        this._startTime = startTime;

        return this;
    }

    /**
     * @returns {?Time}
     */
    getEndTime() {
        return this._endTime;
    }

    /**
     * @param {Time} endTime
     * @returns {FreezeTransaction}
     */
    setEndTime(endTime) {
        this._requireNotFrozen();
        this._endTime = endTime;

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.freeze.freeze(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
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
            startHour: this._startTime?.hour,
            startMin: this._startTime?.min,
            endHour: this._endTime?.hour,
            endMin: this._endTime?.min,
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
TRANSACTION_REGISTRY.set("freeze", FreezeTransaction._fromProtobuf);
