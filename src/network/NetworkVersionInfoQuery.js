/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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
import NetworkVersionInfo from "./NetworkVersionInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IQuery} HashgraphProto.proto.IQuery
 * @typedef {import("@hashgraph/proto").proto.IQueryHeader} HashgraphProto.proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").proto.IResponse} HashgraphProto.proto.IResponse
 * @typedef {import("@hashgraph/proto").proto.IResponseHeader} HashgraphProto.proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoQuery} HashgraphProto.proto.INetworkGetVersionInfoQuery
 * @typedef {import("@hashgraph/proto").proto.INetworkGetVersionInfoResponse} HashgraphProto.proto.INetworkGetVersionInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<NetworkVersionInfo>}
 */
export default class NetworkVersionInfoQuery extends Query {
    constructor() {
        super();
    }

    /**
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {NetworkVersionInfoQuery}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static _fromProtobuf(query) {
        return new NetworkVersionInfoQuery();
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.network.getVersionInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const networkGetVersionInfo =
            /** @type {HashgraphProto.proto.INetworkGetVersionInfoResponse} */ (
                response.networkGetVersionInfo
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            networkGetVersionInfo.header
        );
    }

    /**
     * @protected
     * @override
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Promise<NetworkVersionInfo>}
     */
    _mapResponse(response) {
        const info =
            /** @type {HashgraphProto.proto.INetworkGetVersionInfoResponse} */ (
                response.networkGetVersionInfo
            );
        return Promise.resolve(NetworkVersionInfo._fromProtobuf(info));
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            networkGetVersionInfo: {
                header,
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

        return `NetworkVersionInfoQuery:${timestamp.toString()}`;
    }
}

QUERY_REGISTRY.set(
    "networkGetVersionInfo",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    NetworkVersionInfoQuery._fromProtobuf,
);
