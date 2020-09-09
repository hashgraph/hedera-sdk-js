import Query from "./Query";
import TransactionReceipt from "./TransactionReceipt";
import TransactionId from "./TransactionId";
import proto from "@hashgraph/proto";
import Channel from "./Channel";

/**
 * @augments {Query<TransactionReceipt>}
 */
export default class TransactionReceiptQuery extends Query {
    /**
     * @param {object} props
     * @param {TransactionId | string} [props.transactionId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TransactionId}
         */
        this._transactionId = null;

        if (props.transactionId != null) {
            this.setTransactionId(props.transactionId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {TransactionReceiptQuery}
     */
    static _fromProtobuf(query) {
        const receipt = /** @type {proto.ITransactionGetReceiptQuery} */ (query.transactionGetReceipt);

        return new TransactionReceiptQuery({
            transactionId: receipt.transactionID
                ? TransactionId._fromProtobuf(receipt.transactionID)
                : undefined,
        });
    }

    /**
     * Set the transaction ID for which the receipt is being requested.
     *
     * @param {TransactionId | string} transactionId
     * @returns {this}
     */
    setTransactionId(transactionId) {
        this._transactionId =
            transactionId instanceof TransactionId
                ? transactionId
                : TransactionId.fromString(transactionId);

        return this;
    }

    /**
     * @protected
     * @override
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return false;
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.getTransactionReceipts(query);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {TransactionReceipt}
     */
    _mapResponse(response) {
        return TransactionReceipt._fromProtobuf(
            /** @type {proto.ITransactionReceipt} */ (response
                .transactionGetReceipt?.receipt)
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            transactionGetReceipt: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                transactionID: this._transactionId?._toProtobuf(),
            },
        };
    }
}
