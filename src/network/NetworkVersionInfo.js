import SemanticVersion from "./SemanticVersion";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").INetworkGetVersionInfoResponse} proto.INetworkGetVersionInfoResponse
 * @typedef {import("@hashgraph/proto").ISemanticVersion} proto.ISemanticVersion
 */

/**
 * Response when the client sends the node CryptoGetVersionInfoQuery.
 */
export default class NetworkVersionInfo {
    /**
     * @private
     * @param {object} props
     * @param {SemanticVersion} props.protobufVersion
     * @param {SemanticVersion} props.servicesVesion
     *
     */
    constructor(props) {
        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.protobufVersion = props.protobufVersion;

        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.servicesVesion = props.servicesVesion;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.INetworkGetVersionInfoResponse} info
     * @returns {NetworkVersionInfo}
     */
    static _fromProtobuf(info) {
        return new NetworkVersionInfo({
            protobufVersion: SemanticVersion._fromProtobuf(
                /** @type {proto.ISemanticVersion} */
                (info.hapiProtoVersion)
            ),
            servicesVesion: SemanticVersion._fromProtobuf(
                /** @type {proto.ISemanticVersion} */
                (info.hederaServicesVersion)
            ),
        });
    }

    /**
     * @internal
     * @returns {proto.INetworkGetVersionInfoResponse}
     */
    _toProtobuf() {
        return {
            hapiProtoVersion: this.protobufVersion._toProtobuf(),
            hederaServicesVersion: this.servicesVesion._toProtobuf(),
        };
    }
}
