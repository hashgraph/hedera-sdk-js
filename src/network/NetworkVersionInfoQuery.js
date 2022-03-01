import Query, { QUERY_REGISTRY } from "../query/Query.js";
import NetworkVersionInfo from "./NetworkVersionInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").INetworkGetVersionInfoQuery} proto.INetworkGetVersionInfoQuery
 * @typedef {import("@hashgraph/proto").INetworkGetVersionInfoResponse} proto.INetworkGetVersionInfoResponse
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
     * @param {proto.IQuery} query
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
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.network.getVersionInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const networkGetVersionInfo =
            /** @type {proto.INetworkGetVersionInfoResponse} */ (
                response.networkGetVersionInfo
            );
        return /** @type {proto.IResponseHeader} */ (
            networkGetVersionInfo.header
        );
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<NetworkVersionInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.INetworkGetVersionInfoResponse} */ (
            response.networkGetVersionInfo
        );
        return Promise.resolve(NetworkVersionInfo._fromProtobuf(info));
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
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
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            /** @type {import("../transaction/TransactionId.js").default} */ (
                this._paymentTransactionId
            ).validStart
        );
        return `NetworkVersionInfoQuery:${timestamp.toString()}`;
    }
}

QUERY_REGISTRY.set(
    "networkGetVersionInfo",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    NetworkVersionInfoQuery._fromProtobuf
);
