import Query from "./Query";
import TransactionReceipt from "./TransactionReceipt";
import TransactionId from "./TransactionId";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionReceipt>}
 */
export default class TransactionReceiptQuery extends Query {
    /**
     * @param {object} properties
     * @param {TransactionId} [properties.transactionId]
     */
    constructor(properties) {
        super();

        /**
         * @private
         * @type {?TransactionId}
         */
        this._transactionId = null;
        if (properties?.transactionId != null) {
            this.setTransactionId(properties?.transactionId);
        }
    }

    /**
     * Set the transaction ID for which the receipt is being requested.
     *
     * @param {TransactionId} transactionId
     * @returns {TransactionReceiptQuery}
     */
    setTransactionId(transactionId) {
        this._transactionId = transactionId;
        return this;
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {TransactionReceipt}
     */
    _mapResponse(response) {
        return TransactionReceipt._fromProtobuf(
            // @ts-ignore
            response.transactionGetReceipt?.receipt
        );
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            transactionGetReceipt: {
                header: queryHeader,
                transactionID: this._transactionId?._toProtobuf(),
            },
        };
    }
}
