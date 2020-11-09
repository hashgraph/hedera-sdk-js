import TokenId from "../token/TokenId.js";
import Long from "long";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenBalance} proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @augments {ObjectMap<TokenId, Long>}
 */
export default class TokenBalanceMap extends ObjectMap {
    constructor() {
        super((s) => TokenId.fromString(s));
    }

    /**
     * @param {proto.ITokenBalance[]} balances
     * @returns {TokenBalanceMap}
     */
    static _fromProtobuf(balances) {
        const tokenBalances = new TokenBalanceMap();

        for (const balance of balances) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (balance.tokenId)
            );

            tokenBalances._set(
                tokenId,
                Long.fromValue(/** @type {Long} */ (balance.balance))
            );
        }

        return tokenBalances;
    }
}
