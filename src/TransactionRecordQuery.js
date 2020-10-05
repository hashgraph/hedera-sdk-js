import Query, { QUERY_REGISTRY } from "./Query";
import Status from "./Status";
import TransactionRecord from "./TransactionRecord";
import TransactionId from "./TransactionId";
import * as proto from "@hashgraph/proto";
import Channel from "./channel/Channel";

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
        if (props.transactionId != null) {
            this.setTransactionId(props.transactionId);
        }
    }

    /**
     * @internal
     * @returns {TransactionRecordQuery}
     */
    static _new() {
        return new TransactionRecordQuery();
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
     * @abstract
     * @protected
     * @param {Status} responseStatus
     * @param {proto.IResponse} response
     * @returns {boolean}
     */
    _shouldRetry(responseStatus, response) {
        return false;
        // TODO:
        // switch (responseStatus.code) {
        //     case Status.Busy.code:
        //     case Status.Unknown.code:
        //     case Status.ReceiptNotFound.code:
        //     case Status.RecordNotFound.code:
        //         return true;
        //     default:
        //     // Do nothing
        // }

        // const transactionGetRecord = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);
        // const record = /** @type {proto.ITransactionRecord} */ (transactionGetRecord.transactionRecord);
        // const receipt = /** @type {proto.ITransactionReceipt} */ (record.receipt);
        // const status = Status._fromCode(
        //     /** @type {proto.ResponseCodeEnum} */ (receipt.status)
        // );

        // switch (status.code) {
        //     case Status.Ok.code:
        //     case Status.Busy.code:
        //     case Status.Unknown.code:
        //     case Status.ReceiptNotFound.code:
        //     case Status.RecordNotFound.code:
        //         return true;
        //     default:
        //         return false;
        // }
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.getTxRecordByTxID(query);
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
     * @returns {Promise<TransactionRecord>}
     */
    _mapResponse(response) {
        const record = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);

        return Promise.resolve(
            TransactionRecord._fromProtobuf(
                /** @type {proto.ITransactionRecord} */ (record.transactionRecord)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            transactionGetRecord: {
                header,
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionRecordQuery._fromProtobuf
);
