import Query, { QUERY_REGISTRY } from "./Query";
import NetworkVersionInfo from "./NetworkVersionInfo";
import proto from "@hashgraph/proto";

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
     * @returns {NetworkVersionInfo}
     */
    _mapResponse(response) {
        const info = /** @type {proto.INetworkGetVersionInfoResponse} */ (response.networkGetVersionInfo);
        return NetworkVersionInfo._fromProtobuf(info);
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            networkGetVersionInfo: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
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
