import Query from "./Query";
import NetworkVersionInfo from "./NetworkVersionInfo";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<NetworkVersionInfo>}
 */
export default class NetworkInfoQuery extends Query {
    constructor() {
        super();
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {NetworkVersionInfo}
     */
    _mapResponse(response) {
        // @ts-ignore
        return NetworkVersionInfo._fromProtobuf(response.networkGetVersionInfo);
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
