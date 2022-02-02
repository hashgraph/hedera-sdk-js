/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").WrappedTransactionType} proto.WrappedTransactionType
 */

export default class WrappedTransactionType {
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
            case WrappedTransactionType.EthereumFrontier:
                return "ETHEREUM_FRONTIER";
            case WrappedTransactionType.EthereumAccessList:
                return "ETHEREUM_ACCESS_LIST";
            case WrappedTransactionType.EthereumFeeMarket:
                return "ETHEREUM_FEE_MARKET";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {WrappedTransactionType}
     */
    static _fromCode(code) {
        switch (code) {
            case 0:
                return WrappedTransactionType.EthereumFrontier;
            case 1:
                return WrappedTransactionType.EthereumAccessList;
            case 2:
                return WrappedTransactionType.EthereumFeeMarket;
        }

        throw new Error(
            `(BUG) WrappedTransactionType.fromCode() does not handle code: ${code}`
        );
    }

    /**
     * @returns {proto.WrappedTransactionType}
     */
    valueOf() {
        return this._code;
    }
}

/**
 *
 */
WrappedTransactionType.EthereumFrontier = new WrappedTransactionType(0);
WrappedTransactionType.EthereumAccessList = new WrappedTransactionType(1);
WrappedTransactionType.EthereumFeeMarket = new WrappedTransactionType(2);
