import * as HashgraphProto from "@hashgraph/proto";

export default class SemanticVersion {
    /**
     * @private
     * @param {object} props
     * @param {number} props.major
     * @param {number} props.minor
     * @param {number} props.patch
     */
    constructor(props) {
        /** @readonly */
        this.major = props.major;
        /** @readonly */
        this.minor = props.minor;
        /** @readonly */
        this.patch = props.patch;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ISemanticVersion} version
     * @returns {SemanticVersion}
     */
    static _fromProtobuf(version) {
        return new SemanticVersion({
            major: /** @type {number} */ (version.major),
            minor: /** @type {number} */ (version.minor),
            patch: /** @type {number} */ (version.patch),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ISemanticVersion}
     */
    _toProtobuf() {
        return {
            major: this.major,
            minor: this.minor,
            patch: this.patch,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {SemanticVersion}
     */
    static fromBytes(bytes) {
        return SemanticVersion._fromProtobuf(
            HashgraphProto.proto.SemanticVersion.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.SemanticVersion.encode(
            this._toProtobuf()
        ).finish();
    }
}
