import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ICryptoApproval} proto.ICryptoApproval
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("long")} Long
 */

export default class HbarApproval {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId} props.spenderAccountId
     * @param {Hbar} props.amount
     */
    constructor(props) {
        /**
         * The account ID of the spender of the hbar allowance.
         *
         * @readonly
         */
        this.spenderAccountId = props.spenderAccountId;

        /**
         * The amount of the spender's allowance in tinybars.
         *
         * @readonly
         */
        this.amount = props.amount;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ICryptoApproval} approval
     * @returns {HbarApproval}
     */
    static _fromProtobuf(approval) {
        return new HbarApproval({
            spenderAccountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (approval.spender)
            ),
            amount: Hbar.fromTinybars(
                approval.amount != null ? approval.amount : 0
            ),
        });
    }

    /**
     * @internal
     * @returns {proto.ICryptoApproval}
     */
    _toProtobuf() {
        return {
            spender: this.spenderAccountId._toProtobuf(),
            amount: this.amount.toTinybars(),
        };
    }
}
