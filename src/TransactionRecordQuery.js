import Query, { QUERY_REGISTRY } from "./Query";
import TransactionRecord from "./TransactionRecord";
import TransactionId from "./TransactionId";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TransactionRecord>}
 */
export default class TransactionRecordQuery extends Query {
    /**
     * @param {object} props
     * @param {TransactionId} [props.transactionId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TransactionId}
         */
        this._transactionId = null;
        if (props?.transactionId != null) {
            this.setTransactionId(props?.transactionId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {TransactionRecordQuery}
     */
    static _fromProtobuf(query) {
        const record = /** @type {proto.ITransactionGetRecordQuery} */ (query.transactionGetRecord);

        return new TransactionRecordQuery({
            transactionId: record.transactionID
                ? TransactionId._fromProtobuf(record.transactionID)
                : undefined,
        });
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
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const transactionGetRecord = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);
        return /** @type {proto.IResponseHeader} */ (transactionGetRecord.header);
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
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            transactionGetRecord: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                transactionID:
                    this._transactionId != null
                        ? this._transactionId._toProtobuf()
                        : null,
            },
        };
    }
}

QUERY_REGISTRY.set(
    "transactionGetRecord",
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionRecordQuery._fromProtobuf
);
