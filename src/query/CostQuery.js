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

import TransactionId from "../transaction/TransactionId.js";
import Hbar from "../Hbar.js";
import Executable from "../Executable.js";
import AccountId from "../account/AccountId.js";
import { _makePaymentTransaction, COST_QUERY } from "./Query.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../Status.js").default} Status
 * @typedef {import("../Executable.js").ExecutionState} ExecutionState
 */

/**
 * @template OutputT
 * @augments {Executable<HashgraphProto.proto.IQuery, HashgraphProto.proto.IResponse, Hbar>}
 */
export default class CostQuery extends Executable {
    /**
     * @param {import("./Query.js").default<OutputT>} query
     */
    constructor(query) {
        super();

        this._query = query;
        this._grpcDeadline = query._grpcDeadline;
        this._requestTimeout = query._requestTimeout;
        this._nodeAccountIds = query._nodeAccountIds.clone();
        this._operator = query._operator;

        /**
         * @type {HashgraphProto.proto.IQueryHeader | null}
         */
        this._header = null;
    }

    /**
     * @returns {TransactionId}
     */
    _getTransactionId() {
        return this._query._getTransactionId();
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        return `CostQuery:${this._query._getLogId()}`;
    }

    /**
     * @abstract
     * @protected
     * @param {import("../client/Client.js").default<*, *>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (client == null) {
            throw new Error("Cannot do CostQuery without Client");
        }

        const operator =
            this._operator != null ? this._operator : client._operator;

        if (operator == null) {
            throw new Error(
                "`client` must have an `operator` or an explicit payment transaction must be provided"
            );
        }

        if (this._query._nodeAccountIds.isEmpty) {
            this._query._nodeAccountIds.setList(
                client._network.getNodeAccountIdsForExecute()
            );
        }

        // operator.accountId
        const transactionId = TransactionId.generate(operator.accountId);
        if (this._query.paymentTransactionId == null) {
            this._query.setPaymentTransactionId(transactionId);
        }

        this._header = {
            payment: await _makePaymentTransaction(
                this._getLogId(),
                /** @type {import("../transaction/TransactionId.js").default} */
                (TransactionId.generate(new AccountId(0))),
                new AccountId(0),
                operator,
                new Hbar(0)
            ),
            responseType: HashgraphProto.proto.ResponseType.COST_ANSWER,
        };
    }

    /**
     * @abstract
     * @internal
     * @returns {Promise<HashgraphProto.proto.IQuery>}
     */
    _makeRequestAsync() {
        return Promise.resolve(
            this._query._onMakeRequest(
                /** @type {HashgraphProto.proto.IQueryHeader} */ (this._header)
            )
        );
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {[Status, ExecutionState]}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        return this._query._shouldRetry(request, response);
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
        return this._query._mapStatusError(request, response);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<Hbar>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const cost = this._query._mapResponseHeader(response).cost;
        return Promise.resolve(
            Hbar.fromTinybars(/** @type {Long | number} */ (cost))
        );
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return this._query._execute(channel, request);
    }

    /**
     * @param {HashgraphProto.proto.Query} request
     * @returns {Uint8Array}
     */
    _requestToBytes(request) {
        return this._query._requestToBytes(request);
    }

    /**
     * @param {HashgraphProto.proto.Response} response
     * @returns {Uint8Array}
     */
    _responseToBytes(response) {
        return this._query._responseToBytes(response);
    }
}

COST_QUERY.push((query) => new CostQuery(query));
