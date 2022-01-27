import AccountId from "./AccountId.js";
import TokenId from "../token/TokenId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenApproval} proto.ITokenApproval
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("long")} Long
 */

export default class TokenApproval {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId | string} props.tokenId
     * @param {AccountId | string} props.spenderAccountId
     * @param {Long | null} props.amount
     */
    constructor(props) {
        /**
         * The token that the allowance pertains to.
         *
         * @readonly
         */
        this.tokenId =
            props.tokenId instanceof TokenId
                ? props.tokenId
                : TokenId.fromString(props.tokenId);

        /**
         * The account ID of the spender of the hbar allowance.
         *
         * @readonly
         */
        this.spenderAccountId =
            props.spenderAccountId instanceof AccountId
                ? props.spenderAccountId
                : AccountId.fromString(props.spenderAccountId);

        /**
         * The amount of the spender's token allowance.
         *
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
     * @param {proto.ITokenApproval} approval
     * @returns {TokenApproval}
     */
    static _fromProtobuf(approval) {
        return new TokenApproval({
            tokenId: TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (approval.tokenId)
            ),
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (approval.spender)
            ),
            amount: approval.approvedForAll
                ? null
                : /** @type {Long} */ (approval.amount),
        });
    }

    /**
     * @internal
     * @returns {proto.ITokenApproval}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            spender: this.spenderAccountId._toProtobuf(),
            amount: this.amount != null ? this.amount : null,
            approvedForAll: this.amount == null,
        };
    }
}
