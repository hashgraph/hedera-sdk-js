import TokenId from "../token/TokenId.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenBalance} proto.ITokenBalance
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

export default class TokenBalanceMap {
    /**
     * @param {Map<string, Long>} balances
     */
    constructor(balances) {
        this._balances = balances;
    }

    /**
     * @param {proto.ITokenBalance[]} balances
     * @returns {TokenBalanceMap}
     */
    static _fromProtobuf(balances) {
        const tokenBalances = new Map();

        for (const balance of balances) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (balance.tokenId)
            );

            tokenBalances.set(
                tokenId.toString(),
                Long.fromValue(/** @type {Long} */ (balance.balance))
            );
        }

        return new TokenBalanceMap(tokenBalances);
    }

    /**
     * @param {TokenId} tokenId
     * @returns {?Long}
     */
    get(tokenId) {
        const token = new TokenId(tokenId).toString();
        return this._balances.get(token) || null;
    }

    /**
     * @returns {IterableIterator<Long>}
     */
    values() {
        return this._balances.values();
    }

    /**
     * @returns {IterableIterator<TokenId>}
     */
    keys() {
        const keys = [];
        for (const key of this._balances.keys()) {
            keys.push(TokenId.fromString(key));
        }
        return keys[Symbol.iterator]();
    }

    /**
     * @returns {IterableIterator<[TokenId, Long]>}
     */
    [Symbol.iterator]() {
        /**
         * @type {Map<TokenId, Long>}
         */
        const map = new Map();

        for (const [key, value] of this._balances) {
            map.set(TokenId.fromString(key), value);
        }

        return /**@type {IterableIterator<[TokenId, Long]>} */ (map[
            Symbol.iterator
        ]());
    }

    /**
     * @returns {string}
     */
    toString() {
        let s = "{\n";
        for (const [key, value] of this._balances) {
            s += `\t{\n\t\ttokenId: ${key.toString()},\n\t\tbalance: ${value.toString()}\n\t},\n`;
        }
        s += "}\n";
        return s;
    }
}
