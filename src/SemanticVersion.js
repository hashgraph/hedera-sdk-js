import proto from "@hashgraph/proto";

export default class SemanticVersion {
    /**
     * @private
     * @param {object} properties
     * @param {number} properties.major
     * @param {number} properties.minor
     * @param {number} properties.patch
     */
    constructor(properties) {
        /** @readonly */
        this.major = properties.major;
        /** @readonly */
        this.minor = properties.minor;
        /** @readonly */
        this.patch = properties.patch;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ISemanticVersion} version
     * @returns {SemanticVersion}
     */
    static _fromProtobuf(version) {
        return new SemanticVersion({
            // @ts-ignore
            major: version.major,
            // @ts-ignore
            minor: version.minor,
            // @ts-ignore
            patch: version.patch,
        });
    }

    /**
     * @internal
     * @returns {proto.ISemanticVersion}
     */
    _toProtobuf() {
        return {
            major: this.major,
            minor: this.minor,
            patch: this.patch,
        };
    }
}
