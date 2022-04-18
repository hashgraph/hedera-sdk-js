/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import Query, { QUERY_REGISTRY } from "../query/Query.js";
import TransactionRecord from "./TransactionRecord.js";
import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import Status from "../Status.js";
import PrecheckStatusError from "../PrecheckStatusError.js";
import ReceiptStatusError from "../ReceiptStatusError.js";
import { ExecutionState } from "../Executable.js";
import Logger from "js-logger";
import * as HashgraphProto from "@hashgraph/proto";

const { proto } = HashgraphProto;

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * @augments {Query<TransactionRecord>}
 */
export default class TransactionRecordQuery extends Query {
    /**
     * @param {object} [props]
     * @param {TransactionId} [props.transactionId]
     * @param {boolean} [props.includeChildren]
     * @param {boolean} [props.includeDuplicates]
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
     * @returns {?TransactionId}
     */
    get transactionId() {
        return this._transactionId;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {TransactionRecordQuery}
     */
    static _fromProtobuf(query) {
        const record =
            /** @type {HashgraphProto.proto.ITransactionGetRecordQuery} */ (
                query.transactionGetRecord
            );

        return new TransactionRecordQuery({
            transactionId: record.transactionID
                ? TransactionId._fromProtobuf(record.transactionID)
                : undefined,
            includeChildren:
                record.includeChildRecords != null
                    ? record.includeChildRecords
                    : undefined,
            includeDuplicates:
                record.includeDuplicates != null
                    ? record.includeDuplicates
                    : undefined,
        });
    }

    /**
     * Set the transaction ID for which the record is being requested.
     *
     * @param {TransactionId | string} transactionId
     * @returns {TransactionRecordQuery}
     */
    setTransactionId(transactionId) {
        this._transactionId =
            typeof transactionId === "string"
                ? TransactionId.fromString(transactionId)
                : transactionId.clone();

        return this;
    }

    /**
     * @param {boolean} includeChildren
     * @returns {TransactionRecordQuery}
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
     * @param {boolean} includeDuplicates
     * @returns {TransactionRecordQuery}
     */
    setIncludeDuplicates(includeDuplicates) {
        this._duplicates = includeDuplicates;
        return this;
    }

    /**
     * @returns {boolean}
     */
    get includeDuplicates() {
        return this._duplicates != null ? this._duplicates : false;
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {ExecutionState}
     */
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
            case Status.RecordNotFound:
                return ExecutionState.Retry;

            case Status.Ok:
                break;

            default:
                return ExecutionState.Error;
        }

        const transactionGetRecord =
            /** @type {HashgraphProto.proto.ITransactionGetRecordResponse} */ (
                response.transactionGetRecord
            );
        const header = /** @type {HashgraphProto.proto.IResponseHeader} */ (
            transactionGetRecord.header
        );

        if (
            header.responseType ===
            HashgraphProto.proto.ResponseType.COST_ANSWER
        ) {
            return ExecutionState.Finished;
        }

        const record = /** @type {HashgraphProto.proto.ITransactionRecord} */ (
            transactionGetRecord.transactionRecord
        );
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                record.receipt
            );
        const receiptStatusCode =
            /** @type {HashgraphProto.proto.ResponseCodeEnum} */ (
                receipt.status
            );
        status = Status._fromCode(receiptStatusCode);

        Logger.debug(
            `[${this._getLogId()}] received record's receipt ${status.toString()}`
        );

        switch (status) {
            case Status.Ok:
            case Status.Busy:
            case Status.Unknown:
            case Status.ReceiptNotFound:
            case Status.RecordNotFound:
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

        const transactionGetRecord =
            /** @type {HashgraphProto.proto.ITransactionGetRecordResponse} */ (
                response.transactionGetRecord
            );
        const record = /** @type {HashgraphProto.proto.ITransactionRecord} */ (
            transactionGetRecord.transactionRecord
        );
        const receipt =
            /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                record.receipt
            );
        const receiptStatusError =
            /** @type {HashgraphProto.proto.ResponseCodeEnum} */ (
                receipt.status
            );

        status = Status._fromCode(receiptStatusError);

        return new ReceiptStatusError({
            status,
            transactionId: this._getTransactionId(),
            transactionReceipt: TransactionReceipt._fromProtobuf({ receipt }),
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
        return channel.crypto.getTxRecordByTxID(request);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const transactionGetRecord =
            /** @type {HashgraphProto.proto.ITransactionGetRecordResponse} */ (
                response.transactionGetRecord
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            transactionGetRecord.header
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<TransactionRecord>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const record =
            /** @type {HashgraphProto.proto.ITransactionGetRecordResponse} */ (
                response.transactionGetRecord
            );

        return Promise.resolve(TransactionRecord._fromProtobuf(record));
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            transactionGetRecord: {
                header,
                transactionID:
                    this._transactionId != null
                        ? this._transactionId._toProtobuf()
                        : null,
                includeChildRecords: this._includeChildren,
                includeDuplicates: this._includeDuplicates,
            },
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp =
            this._paymentTransactionId != null &&
            this._paymentTransactionId.validStart != null
                ? this._paymentTransactionId.validStart
                : this._timestamp;

        return `TransactionRecordQuery:${timestamp.toString()}`;
    }
}

QUERY_REGISTRY.set(
    "transactionGetRecord",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransactionRecordQuery._fromProtobuf
);
