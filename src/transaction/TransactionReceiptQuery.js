import Query, { QUERY_REGISTRY } from "../query/Query.js";
import Status from "../Status.js";
import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import PrecheckStatusError from "../PrecheckStatusError.js";
import ReceiptStatusError from "../ReceiptStatusError.js";
import { ExecutionState } from "../Executable.js";
import Logger from "js-logger";
import * as HashgraphProto from "@hashgraph/proto";

const { proto } = HashgraphProto;

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
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {TransactionReceiptQuery}
     */
    static _fromProtobuf(query) {
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionGetReceiptQuery} */ (
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
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {ExecutionState}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        let status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : proto.ResponseCodeEnum.OK
        );

        Logger.debug(
            `[${this._getLogId()}] received node precheck status ${status.toString()}`
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
            /** @type {HashgraphProto.proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                transactionGetReceipt.receipt
            );
        const receiptStatusCode =
            /** @type {HashgraphProto.proto.ResponseCodeEnum} */ (
                receipt.status
            );

        status = Status._fromCode(receiptStatusCode);

        Logger.debug(
            `[${this._getLogId()}] received receipt status ${status.toString()}`
        );

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
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        let status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : proto.ResponseCodeEnum.OK
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
            /** @type {HashgraphProto.proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                transactionGetReceipt.receipt
            );
        const receiptStatusCode =
            /** @type {HashgraphProto.proto.ResponseCodeEnum} */ (
                receipt.status
            );

        status = Status._fromCode(receiptStatusCode);

        if (this._transactionId == null) {
            throw new Error(
                "Failed to construct `ReceiptStatusError` because `transactionId` is `null`"
            );
        }

        return new ReceiptStatusError({
            status,
            transactionId: this._transactionId,
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
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.getTransactionReceipts(request);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const transactionGetReceipt =
            /** @type {HashgraphProto.proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            transactionGetReceipt.header
        );
    }

    /**
     * @protected
     * @override
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const transactionGetReceipt =
            /** @type {HashgraphProto.proto.ITransactionGetReceiptResponse} */ (
                response.transactionGetReceipt
            );

        return Promise.resolve(
            TransactionReceipt._fromProtobuf(transactionGetReceipt)
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
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

    /**
     * @returns {string}
     */
    _getLogId() {
        return `TransactionReceiptQuery:${this._timestamp.toString()}`;
    }
}

QUERY_REGISTRY.set(
    "transactionGetReceipt",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionReceiptQuery._fromProtobuf
);
