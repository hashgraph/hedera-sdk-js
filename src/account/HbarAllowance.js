import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ICryptoAllowance} proto.ICryptoAllowance
 * @typedef {import("@hashgraph/proto").IGrantedCryptoAllowance} proto.IGrantedCryptoAllowance
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("long")} Long
 */

export default class HbarAllowance {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId} props.spenderAccountId
     * @param {AccountId | null} props.ownerAccountId
     * @param {Hbar} props.amount
     */
    constructor(props) {
        /**
         * The account ID of the hbar allowance spender.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The account ID of the hbar allowance owner.
         *
         * @readonly
         */
        this.ownerAccountId = props.ownerAccountId;

        /**
         * The current balance of the spender's allowance in tinybars.
         *
         * @readonly
         */
        this.amount = props.amount;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ICryptoAllowance} approval
     * @returns {HbarAllowance}
     */
    static _fromProtobuf(approval) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (approval.spender)
            ),
            ownerAccountId:
                approval.owner != null
                    ? AccountId._fromProtobuf(
                          /**@type {proto.IAccountID}*/ (approval.owner)
                      )
                    : null,
            amount: Hbar.fromTinybars(
                approval.amount != null ? approval.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @param {proto.IGrantedCryptoAllowance} approval
     * @returns {HbarAllowance}
     */
    static _fromGrantedProtobuf(approval) {
        return new HbarAllowance({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (approval.spender)
            ),
            ownerAccountId: null,
            amount: Hbar.fromTinybars(
                approval.amount != null ? approval.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @returns {proto.ICryptoAllowance}
     */
    _toProtobuf() {
        return {
            spender: this.spenderAccountId._toProtobuf(),
            owner:
                this.ownerAccountId != null
                    ? this.ownerAccountId._toProtobuf()
                    : null,
            amount: this.amount.toTinybars(),
        };
    }
}
