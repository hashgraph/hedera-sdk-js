/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").SubType} proto.SubType
 */

export default class SubType {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case SubType.DEFAULT:
                return "DEFAULT";
            case SubType.TOKEN_FUNGIBLE_COMMON:
                return "TOKEN_FUNGIBLE_COMMON";
            case SubType.TOKEN_NON_FUNGIBLE_UNIQUE:
                return "TOKEN_NON_FUNGIBLE_UNIQUE";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {SubType}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return SubType.DEFAULT;
            case 1:
                return SubType.TOKEN_FUNGIBLE_COMMON;
            case 2:
                return SubType.TOKEN_NON_FUNGIBLE_UNIQUE;
        }

        throw new Error(
            `(BUG) SubType.fromCode() does not handle code: ${code}`
        );
    }

    /**
     * @returns {proto.SubType}
     */
    valueOf() {
        return this._code;
    }
}

SubType.DEFAULT = new SubType(0);

SubType.TOKEN_FUNGIBLE_COMMON = new SubType(1);

SubType.TOKEN_NON_FUNGIBLE_UNIQUE = new SubType(2);
