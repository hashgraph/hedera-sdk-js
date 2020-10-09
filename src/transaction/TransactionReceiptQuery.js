import Query, { QUERY_REGISTRY } from "../query/Query.js";
import Status from "../Status.js";
import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ITransactionReceipt} proto.ITransactionReceipt
 * @typedef {import("@hashgraph/proto").ITransactionGetReceiptQuery} proto.ITransactionGetReceiptQuery
 * @typedef {import("@hashgraph/proto").ITransactionGetReceiptResponse} proto.ITransactionGetReceiptResponse
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 */

/**
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<TransactionReceipt>}
 */
export default class TransactionReceiptQuery extends Query {
    /**
     * @param {object} [props]
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
     * @param {proto.IQuery} query
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
     * @returns {?TransactionId}
     */
    get transactionId() {
        return this._transactionId;
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
     * @override
     * @protected
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return false;
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
                return true;

            default:
            // continue to checking receipt status
        }

        const transactionGetReceipt = /** @type {proto.ITransactionGetReceiptResponse} */ (response.transactionGetReceipt);
        const receipt = /** @type {proto.ITransactionReceipt} */ (transactionGetReceipt.receipt);
        const receiptStatusCode = /** @type {proto.ResponseCodeEnum} */ (receipt.status);
        const receiptStatus = Status._fromCode(receiptStatusCode);

        switch (receiptStatus) {
            case Status.Ok:
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
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
        return channel.crypto.getTransactionReceipts(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const transactionGetReceipt = /** @type {proto.ITransactionGetReceiptResponse} */ (response.transactionGetReceipt);
        return /** @type {proto.IResponseHeader} */ (transactionGetReceipt.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {proto.IQuery} request
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const transactionGetReceipt = /** @type {proto.ITransactionGetReceiptResponse} */ (response.transactionGetReceipt);
        const receipt = /** @type {proto.ITransactionReceipt} */ (transactionGetReceipt.receipt);

        return Promise.resolve(TransactionReceipt._fromProtobuf(receipt));
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            transactionGetReceipt: {
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
    "transactionGetReceipt",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionReceiptQuery._fromProtobuf
);
