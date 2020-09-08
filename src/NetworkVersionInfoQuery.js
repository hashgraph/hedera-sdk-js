import Query from "./Query";
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
     * @override
     * @param {proto.IResponse} response
     * @returns {NetworkVersionInfo}
     */
    _mapResponse(response) {
        const info = /** @type {proto.INetworkGetVersionInfoResponse} */ (response.networkGetVersionInfo);

        return NetworkVersionInfo._fromProtobuf(info);
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            networkGetVersionInfo: {
                header: queryHeader,
            },
        };
    }
}
