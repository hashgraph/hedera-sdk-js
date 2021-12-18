import Query, { QUERY_REGISTRY } from "../query/Query.js";
import Status from "../Status.js";
import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import PrecheckStatusError from "../PrecheckStatusError.js";
import ReceiptStatusError from "../ReceiptStatusError.js";
import { ExecutionState } from "../Executable.js";
import { ResponseCodeEnum } from "@hashgraph/proto";

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
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * @augments {Query<TransactionReceipt>}
 */
export default class TransactionReceiptQuery extends Query {
    /**
     * @param {object} [props]
     * @param {TransactionId | string} [props.transactionId]
     * @param {boolean} [props.includeDuplicates]
     * @param {boolean} [props.includeChildren]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TransactionId}
         */
        this._transactionId = null;

        /**
         * @private
         * @type {?boolean}
         */
        this._includeChildren = null;

        /**
         * @private
         * @type {?boolean}
         */
        this._includeDuplicates = null;

        if (props.transactionId != null) {
            this.setTransactionId(props.transactionId);
        }

        if (props.includeChildren != null) {
            this.setIncludeChildren(props.includeChildren);
        }

        if (props.includeDuplicates != null) {
            this.setIncludeDuplicates(props.includeDuplicates);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {TransactionReceiptQuery}
     */
    static _fromProtobuf(query) {
        const receipt = /** @type {proto.ITransactionGetReceiptQuery} */ (
            query.transactionGetReceipt
        );

        return new TransactionReceiptQuery({
            transactionId: receipt.transactionID
                ? TransactionId._fromProtobuf(receipt.transactionID)
                : undefined,
            includeDuplicates:
                receipt.includeDuplicates != null
                    ? receipt.includeDuplicates
                    : undefined,
            includeChildren:
                receipt.includeChildReceipts != null
                    ? receipt.includeChildReceipts
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
            typeof transactionId === "string"
                ? TransactionId.fromString(transactionId)
                : transactionId.clone();

        return this;
    }

    /**
     * @param {boolean} includeDuplicates
     * @returns {TransactionReceiptQuery}
     */
    setIncludeDuplicates(includeDuplicates) {
        this._includeDuplicates = includeDuplicates;
        return this;
    }

    /**
     * @returns {boolean}
     */
    get includeDuplicates() {
        return this._includeDuplicates != null
            ? this._includeDuplicates
            : false;
    }

    /**
     * @param {boolean} includeChildren
     * @returns {TransactionReceiptQuery}
     */
    setIncludeChildren(includeChildren) {
        this._includeChildren = includeChildren;
        return this;
    }

    /**
     * @returns {boolean}
     */
    get includeChildren() {
        return this._includeChildren != null ? this._includeChildren : false;
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
     * @internal
     * @param {proto.IQuery} request
     * @param {proto.IResponse} response
     * @returns {ExecutionState}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        let status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : ResponseCodeEnum.OK
        );

        switch (status) {
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
                return ExecutionState.Retry;
            case Status.Ok:
                break;
            default:
                return ExecutionState.Error;
        }

        const transactionGetReceipt =
            /** @type {proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        const receipt = /** @type {proto.ITransactionReceipt} */ (
            transactionGetReceipt.receipt
        );
        const receiptStatusCode = /** @type {proto.ResponseCodeEnum} */ (
            receipt.status
        );

        status = Status._fromCode(receiptStatusCode);

        switch (status) {
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
                return ExecutionState.Retry;
            case Status.Success:
                return ExecutionState.Finished;
            default:
                return ExecutionState.Error;
        }
    }

    /**
     * @override
     * @internal
     * @param {proto.IQuery} request
     * @param {proto.IResponse} response
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        let status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : ResponseCodeEnum.OK
        );

        switch (status) {
            case Status.Ok:
                // Do nothing
                break;

            default:
                return new PrecheckStatusError({
                    status,
                    transactionId: this._getTransactionId(),
                });
        }

        const transactionGetReceipt =
            /** @type {proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        const receipt = /** @type {proto.ITransactionReceipt} */ (
            transactionGetReceipt.receipt
        );
        const receiptStatusCode = /** @type {proto.ResponseCodeEnum} */ (
            receipt.status
        );

        status = Status._fromCode(receiptStatusCode);

        return new ReceiptStatusError({
            status,
            transactionId: this._getTransactionId(),
            transactionReceipt: TransactionReceipt._fromProtobuf(
                transactionGetReceipt
            ),
        });
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (
            this._transactionId != null &&
            this._transactionId.accountId != null
        ) {
            this._transactionId.accountId.validateChecksum(client);
        }
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
        const transactionGetReceipt =
            /** @type {proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        return /** @type {proto.IResponseHeader} */ (
            transactionGetReceipt.header
        );
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
        const transactionGetReceipt =
            /** @type {proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );

        return Promise.resolve(
            TransactionReceipt._fromProtobuf(transactionGetReceipt)
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
            transactionGetReceipt: {
                header,
                transactionID:
                    this._transactionId != null
                        ? this._transactionId._toProtobuf()
                        : null,
                includeDuplicates: this._includeDuplicates,
                includeChildReceipts: this._includeChildren,
            },
        };
    }
}

QUERY_REGISTRY.set(
    "transactionGetReceipt",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionReceiptQuery._fromProtobuf
);
