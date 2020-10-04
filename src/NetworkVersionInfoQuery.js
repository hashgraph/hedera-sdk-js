import Query, { QUERY_REGISTRY } from "./Query";
import NetworkVersionInfo from "./NetworkVersionInfo";
import * as proto from "@hashgraph/proto";
import Channel from "./channel/Channel";

/**
 * @augments {Query<NetworkVersionInfo>}
 */
export default class NetworkVersionInfoQuery extends Query {
    constructor() {
        super();
    }

    /**
     * @param {proto.Query} _
     * @returns {NetworkVersionInfoQuery}
     */
    static _fromProtobuf(_) {
        return new NetworkVersionInfoQuery();
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.network.getVersionInfo(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const networkGetVersionInfo = /** @type {proto.INetworkGetVersionInfoResponse} */ (response.networkGetVersionInfo);
        return /** @type {proto.IResponseHeader} */ (networkGetVersionInfo.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<NetworkVersionInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.INetworkGetVersionInfoResponse} */ (response.networkGetVersionInfo);
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
}

QUERY_REGISTRY.set(
    "networkGetVersionInfo",
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/unbound-method
    NetworkVersionInfoQuery._fromProtobuf
);
