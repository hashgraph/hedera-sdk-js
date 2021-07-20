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
            case SubType.Default:
                return "DEFAULT";
            case SubType.TokenFungibleCommon:
                return "TOKEN_FUNGIBLE_COMMON";
            case SubType.TokenNonFungibleUnique:
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
                return SubType.Default;
            case 1:
                return SubType.TokenFungibleCommon;
            case 2:
                return SubType.TokenNonFungibleUnique;
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

SubType.Default = new SubType(0);

SubType.TokenFungibleCommon = new SubType(1);

SubType.TokenNonFungibleUnique = new SubType(2);
