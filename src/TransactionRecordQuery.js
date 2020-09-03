import Query from "./Query";
import TransactionRecord from "./TransactionRecord";
import TransactionId from "./TransactionId";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionRecord>}
 */
export default class TransactionRecordQuery extends Query {
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
     * Set the transaction ID for which the record is being requested.
     *
     * @param {TransactionId} transactionId
     * @returns {TransactionRecordQuery}
     */
    setTransactionId(transactionId) {
        this._transactionId = transactionId;
        return this;
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {TransactionRecord}
     */
    _mapResponse(response) {
        const record = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);

        return TransactionRecord._fromProtobuf(
            /** @type {proto.ITransactionRecord} */ (record.transactionRecord)
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
            transactionGetRecord: {
                header: queryHeader,
                transactionID: this._transactionId?._toProtobuf(),
            },
        };
    }
}
