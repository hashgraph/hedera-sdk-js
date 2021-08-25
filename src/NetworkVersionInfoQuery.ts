import { QueryBuilder } from "./QueryBuilder";
import { NetworkGetVersionInfoQuery as ProtoNetworkGetVersionInfoQuery } from "./generated/network_get_version_info_pb";
import { QueryHeader } from "./generated/query_header_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/query_pb";
import { NetworkService } from "./generated/network_service_pb_service";
import { Response } from "./generated/response_pb";
import { ResponseHeader } from "./generated/response_header_pb";

export interface SemanticVersion {
    // Increases with incompatible API changes
    major: number;

    // Increases with backwards-compatible new functionality
    minor: number;

    // Increases with backwards-compatible bug fixes
    patch: number;
}

export interface NetworkVersionInfo {
    hapiProtoVersion: SemanticVersion;
    hederaServicesVersion: SemanticVersion;
}

/**
 * Get the deployed versions of Hedera Services and the HAPI proto in semantic version format.
 */
export class NetworkVersionInfoQuery extends QueryBuilder<NetworkVersionInfo> {
    private readonly _builder: ProtoNetworkGetVersionInfoQuery;

    public constructor() {
        super();

        this._builder = new ProtoNetworkGetVersionInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setNetworkgetversioninfo(this._builder);
    }

    protected _doLocalValidate(): void {
        // do nothing
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return NetworkService.getVersionInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getNetworkgetversioninfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): NetworkVersionInfo {
        const res = response.getNetworkgetversioninfo()!;
        const hapi = res.getHapiprotoversion()!;
        const hedera = res.getHederaservicesversion()!;

        return {
            hapiProtoVersion: {
                major: hapi.getMajor(),
                minor: hapi.getMinor(),
                patch: hapi.getPatch()
            },
            hederaServicesVersion: {
                major: hedera.getMajor(),
                minor: hedera.getMinor(),
                patch: hedera.getPatch()
            }
        };
    }
}
