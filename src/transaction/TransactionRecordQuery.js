import Query, { QUERY_REGISTRY } from "../query/Query.js";
import TransactionRecord from "./TransactionRecord.js";
import TransactionId from "./TransactionId.js";
import Status from "../Status.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").ITransactionRecord} proto.ITransactionRecord
 * @typedef {import("@hashgraph/proto").ITransactionReceipt} proto.ITransactionReceipt
 * @typedef {import("@hashgraph/proto").ITransactionGetRecordResponse} proto.ITransactionGetRecordResponse
 * @typedef {import("@hashgraph/proto").ITransactionGetRecordQuery} proto.ITransactionGetRecordQuery
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TransactionRecord>}
 */
export default class TransactionRecordQuery extends Query {
    /**
     * @param {object} [props]
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
     * @returns {?TransactionId}
     */
    get transactionId() {
        return this._transactionId;
    }

    /**
     * @internal
     * @param {proto.IQuery} query
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
     * @override
     * @protected
     * @param {Status} responseStatus
     * @param {proto.IResponse} response
     * @returns {boolean}
     */
    _shouldRetry(responseStatus, response) {
        switch (responseStatus) {
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
            case Status.RecordNotFound:
                return true;

            default:
            // continue to checking receipt status
        }

        const transactionGetRecord = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);
        const record = /** @type {proto.ITransactionRecord} */ (transactionGetRecord.transactionRecord);
        const receipt = /** @type {proto.ITransactionReceipt} */ (record.receipt);
        const receiptStatusCode = /** @type {proto.ResponseCodeEnum} */ (receipt.status);
        const receiptStatus = Status._fromCode(receiptStatusCode);

        switch (receiptStatus) {
            case Status.Ok:
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
            case Status.RecordNotFound:
                return true;

            default:
            // looks like its either success or some other error
        }

        return false;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.getTxRecordByTxID(request);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const transactionGetRecord = /** @type {proto.ITransactionGetRecordResponse} */ (response.transactionGetRecord);
        return /** @type {proto.IResponseHeader} */ (transactionGetRecord.header);
    }

    /**
     * @override
     * @override
     * @internal
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
