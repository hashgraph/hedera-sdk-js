import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenAllowance} proto.ITokenAllowance
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("long")} Long
 */

export default class TokenAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId} props.spenderAccountId
     * @param {Long | null} props.amount
     * @param {number} props.decimals
     */
    constructor(props) {
        /**
         * The token that the allowance pertains to.
         *
         * @readonly
         */
        this.tokenId = props.tokenId;

        /**
         * The account ID of the spender of the hbar allowance.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The current balance of the spender's token allowance.
         * **NOTE**: If `null`, the spender has access to all of the account owner's NFT instances
         * (currently owned and any in the future).
         *
         * @readonly
         */
        this.amount = props.amount;

        /**
         * The number of decimal places the token allowance value is divisible by.
         *
         * @readonly
         */
        this.decimals = props.decimals;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ITokenAllowance} allowance
     * @returns {TokenAllowance}
     */
    static _fromProtobuf(allowance) {
        return new TokenAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (allowance.spender)
            ),
            amount: allowance.approvedForAll
                ? null
                : /** @type {Long} */ (allowance.amount),
            decimals: allowance.decimals != null ? allowance.decimals : 0,
        });
    }

    /**
     * @internal
     * @returns {proto.ITokenAllowance}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            spender: this.spenderAccountId._toProtobuf(),
            amount: this.amount != null ? { value: this.amount } : null,
            decimals: this.decimals,
        };
    }
}
