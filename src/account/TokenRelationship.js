import Long from "long";
import TokenId from "../token/TokenId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenRelationship} proto.ITokenRelationship
 * @typedef {import("@hashgraph/proto").TokenKycStatus} proto.TokenKycStatus
 * @typedef {import("@hashgraph/proto").TokenFreezeStatus} proto.TokenFreezeStatus
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/** @enum {number} */
const KycStatus = {
    NotApplicable: 0,
    Granted: 1,
    Revoked: 2,
};

/** @enum {number} */
const FreezeStatus = {
    NotApplicable: 0,
    Frozen: 1,
    NotFrozen: 2,
};

/**
 * Token's information related to the given Account
 */
export default class TokenRelationship {
    /**
     * @param {object} props
     * @param {TokenId} props.tokenId
     * @param {string} props.symbol
     * @param {Long} props.balance
     * @param {KycStatus} props.kycStatus
     * @param {boolean} props.isKycGranted
     * @param {FreezeStatus} props.freezeStatus
     * @param {boolean} props.isFrozen
     */
    constructor(props) {
        /**
         * The ID of the token
         *
         * @readonly
         */
        this.tokenId = props.tokenId;
        /**
         * The Symbol of the token
         *
         * @readonly
         */
        this.symbol = props.symbol;
        /**
         * The balance that the Account holds in the smallest denomination
         *
         * @readonly
         */
        this.balance = props.balance;

        /**
         * The KYC status of the account (KycNotApplicable, Granted or Revoked). If the token does
         * not have KYC key, KycNotApplicable is returned
         *
         * @readonly
         */
        this.kycStatus = props.kycStatus;

        /**
         * The KYC status of the account (KycNotApplicable, Granted or Revoked). If the token does
         * not have KYC key, KycNotApplicable is returned
         *
         * @readonly
         */
        this.isKycGranted = props.isKycGranted;

        /**
         * The Freeze status of the account (FreezeNotApplicable, Frozen or Unfrozen). If the token
         * does not have Freeze key, FreezeNotApplicable is returned
         *
         * @readonly
         */
        this.freezeStatus = props.freezeStatus;

        /**
         * The Freeze status of the account (FreezeNotApplicable, Frozen or Unfrozen). If the token
         * does not have Freeze key, FreezeNotApplicable is returned
         *
         * @readonly
         */
        this.isFrozen = props.isFrozen;

        Object.freeze(this);
    }

    /**
     * @param {proto.ITokenRelationship} relationship
     * @returns {TokenRelationship}
     */
    static _fromProtobuf(relationship) {
        const tokenId = TokenId._fromProtobuf(
            /** @type {proto.ITokenID} */ (relationship.tokenId)
        );
        const kycStatus = /** @type {proto.TokenKycStatus} */ (relationship.kycStatus);
        const freezeStatus = /** @type {proto.TokenFreezeStatus} */ (relationship.freezeStatus);

        return new TokenRelationship({
            tokenId,
            symbol: /** @type {string} */ (relationship.symbol),
            balance:
                relationship.balance != null
                    ? relationship.balance instanceof Long
                        ? relationship.balance
                        : Long.fromValue(relationship.balance)
                    : Long.ZERO,
            kycStatus,
            isKycGranted: kycStatus === 1,
            freezeStatus,
            isFrozen: freezeStatus === 1,
        });
    }

    /**
     * @returns {proto.ITokenRelationship}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            symbol: this.symbol,
            balance: this.balance,
            kycStatus: this.kycStatus,
            freezeStatus: this.freezeStatus,
        };
    }
}
