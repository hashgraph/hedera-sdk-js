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
}
