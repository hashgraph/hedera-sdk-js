import proto from "@hashgraph/proto";
import SemanticVersion from "./SemanticVersion";

/**
 * Response when the client sends the node CryptoGetVersionInfoQuery.
 */
export default class NetworkVersionInfo {
    /**
     * @private
     * @param {object} properties
     * @param {SemanticVersion} properties.protobufVersion
     * @param {SemanticVersion} properties.servicesVesion
     *
     */
    constructor(properties) {
        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.protobufVersion = properties.protobufVersion;

        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.servicesVesion = properties.servicesVesion;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.INetworkGetVersionInfoResponse} info
     */
    static _fromProtobuf(info) {
        return new NetworkVersionInfo({
            protobufVersion: SemanticVersion._fromProtobuf(
                // @ts-ignore
                info.hapiProtoVersion
            ),
            servicesVesion: SemanticVersion._fromProtobuf(
                // @ts-ignore
                info.hederaServicesVersion
            ),
        });
    }

    /**
     * @internal
     * @returns {proto.INetworkGetVersionInfoResponse}
     */
    toProtobuf() {
        return {
            hapiProtoVersion: this.protobufVersion._toProtobuf(),
            hederaServicesVersion: this.servicesVesion._toProtobuf(),
        };
    }
}
