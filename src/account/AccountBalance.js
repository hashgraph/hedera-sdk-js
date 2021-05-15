import Hbar from "../Hbar.js";
import TokenBalanceMap from "./TokenBalanceMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITimestamp} proto.ITimestamp
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ICryptoGetAccountBalanceResponse} proto.ICryptoGetAccountBalanceResponse
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 */

/**
 * @typedef {object} TokenBalanceJson
 * @property {string} tokenId
 * @property {string} balance
 */

/**
 * @typedef {object} AccountBalanceJson
 * @property {string} hbars
 * @property {TokenBalanceJson[]} tokens
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("long")} Long
 */

export default class AccountBalance {
    /**
     * @private
     * @param {object} props
     * @param {Hbar} props.hbars
     * @param {?TokenBalanceMap} props.tokens
     */
    constructor(props) {
        /**
         * The account ID for which this balancermation applies.
         *
         * @readonly
         */
        this.hbars = props.hbars;

        /** @readonly */
        this.tokens = props.tokens;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ICryptoGetAccountBalanceResponse} balance
     * @returns {AccountBalance}
     */
    static _fromProtobuf(balance) {
        return new AccountBalance({
            hbars: Hbar.fromTinybars(/** @type {Long} */ (balance.balance)),
            tokens: TokenBalanceMap._fromProtobuf(
                balance.tokenBalances != null ? balance.tokenBalances : []
            ),
        });
    }

    /**
     * @returns {proto.ICryptoGetAccountBalanceResponse}
     */
    _toProtobuf() {
        const list = [];
        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            list.push({
                token: key._toProtobuf(),
                balance: value,
            });
        }

        return {
            balance: this.hbars.toTinybars(),
            tokenBalances: list,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        const json = this.toJSON();

        return JSON.stringify({
            hbars: json.hbars,
            tokens: JSON.stringify(json.tokens),
        });
    }

    /**
     * @returns {AccountBalanceJson}
     */
    toJSON() {
        const tokens = [];
        for (const [key, value] of this.tokens != null ? this.tokens : []) {
            tokens.push({
                tokenId: key.toString(),
                balance: value.toString(),
            });
        }

        return {
            hbars: this.hbars.toString(),
            tokens,
        };
    }
}
