/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ISemanticVersion} proto.ISemanticVersion
 */

export default class SemanticVersion {
    /**
     * @private
     * @param {object} proto
     * @param {number} proto.major
     * @param {number} proto.minor
     * @param {number} proto.patch
     */
    constructor(proto) {
        /** @readonly */
        this.major = proto.major;

        /** @readonly */
        this.minor = proto.minor;

        /** @readonly */
        this.patch = proto.patch;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ISemanticVersion} version
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
