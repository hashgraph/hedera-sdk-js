/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").SubType} proto.SubType
 */

export default class FeeDataType {
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
            case FeeDataType.Default:
                return "DEFAULT";
            case FeeDataType.TokenFungibleCommon:
                return "TOKEN_FUNGIBLE_COMMON";
            case FeeDataType.TokenNonFungibleUnique:
                return "TOKEN_NON_FUNGIBLE_UNIQUE";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {FeeDataType}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return FeeDataType.Default;
            case 1:
                return FeeDataType.TokenFungibleCommon;
            case 2:
                return FeeDataType.TokenNonFungibleUnique;
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

FeeDataType.Default = new FeeDataType(0);

FeeDataType.TokenFungibleCommon = new FeeDataType(1);

FeeDataType.TokenNonFungibleUnique = new FeeDataType(2);
