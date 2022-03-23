import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IGrantedNftAllowance} proto.IGrantedNftAllowance
 * @typedef {import("@hashgraph/proto").INftAllowance} proto.INftAllowance
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

export default class TokenNftAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {AccountId} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Long[] | null} props.serialNumbers
     * @param {boolean} props.allSerials
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
        this.serialNumbers = props.serialNumbers;

        /**
         * @readonly
         */
        this.allSerials = props.allSerials;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.INftAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromProtobuf(allowance) {
        const allSerials =
            allowance.approvedForAll != null &&
            allowance.approvedForAll.value == true;
        return new TokenNftAllowance({
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
            serialNumbers: allSerials
                ? null
                : allowance.serialNumbers != null
                ? allowance.serialNumbers.map((serialNumber) =>
                      Long.fromValue(serialNumber)
                  )
                : [],
            allSerials,
        });
    }

    /**
     * @internal
     * @param {proto.IGrantedNftAllowance} allowance
     * @returns {TokenNftAllowance}
     */
    static _fromGrantedProtobuf(allowance) {
        return new TokenNftAllowance({
            tokenId: TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (allowance.tokenId)
            ),
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (allowance.spender)
            ),
            ownerAccountId: null,
            serialNumbers:
                allowance.approvedForAll != null && allowance.approvedForAll
                    ? null
                    : allowance.serialNumbers != null
                    ? allowance.serialNumbers.map((serialNumber) =>
                          Long.fromValue(serialNumber)
                      )
                    : [],
            allSerials:
                allowance.approvedForAll != null && allowance.approvedForAll,
        });
    }

    /**
     * @internal
     * @returns {proto.INftAllowance}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            spender: this.spenderAccountId._toProtobuf(),
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            approvedForAll:
                this.serialNumbers == null ? { value: this.allSerials } : null,
            serialNumbers: this.serialNumbers,
        };
    }
}
