import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenAllowance} proto.ITokenAllowance
 * @typedef {import("@hashgraph/proto").IGrantedTokenAllowance} proto.IGrantedTokenAllowance
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

export default class TokenAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Long | null} props.amount
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
         * The account ID of the owner of the hbar allowance.
         *
         * @readonly
         */
        this.ownerAccountId = props.ownerAccountId;

        /**
         * The current balance of the spender's token allowance.
         * **NOTE**: If `null`, the spender has access to all of the account owner's NFT instances
         * (currently owned and any in the future).
         *
         * @readonly
         */
        this.amount = props.amount;

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
            ownerAccountId:
                allowance.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {proto.IAccountID}*/ (allowance.owner)
                      )
                    : null,
            amount:
                allowance.amount != null
                    ? Long.fromValue(/** @type {Long} */ (allowance.amount))
                    : null,
        });
    }

    /**
     * @internal
     * @param {proto.IGrantedTokenAllowance} allowance
     * @returns {TokenAllowance}
     */
    static _fromGrantedProtobuf(allowance) {
        return new TokenAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (allowance.spender)
            ),
            ownerAccountId: null,
            amount:
                allowance.amount != null
                    ? Long.fromValue(/** @type {Long} */ (allowance.amount))
                    : null,
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
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            amount: this.amount,
        };
    }
}
