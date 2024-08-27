/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IAccountAmount} Hashgraph.proto.IAccountAmount
 */

import Long from "long";
import AccountId from "../account/AccountId.js";

export default class AccountAmount {
    /**
     * @param {object} props
     * @param {AccountId} [props.accountId]
     * @param {Long} [props.amount]
     * @param {boolean} [props.isApproval]
     */
    constructor(props = {}) {
        this._accountId = null;
        this._amount = Long.ZERO;
        this._isApproval = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
        if (props.amount != null) {
            this.setAmount(props.amount);
        }
        if (props.isApproval != null) {
            this.setIsApproval(props.isApproval);
        }
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._accountId = accountId;
        return this;
    }

    /**
     * @returns {Long}
     */
    get amount() {
        return this._amount;
    }

    /**
     * @param {Long} amount
     * @returns {this}
     */
    setAmount(amount) {
        this._amount = amount;
        return this;
    }

    /**
     * @returns {boolean?}
     */
    get isApproval() {
        return this._isApproval;
    }

    /**
     * @param {boolean} isApproval
     * @returns {this}
     */
    setIsApproval(isApproval) {
        this._isApproval = isApproval;
        return this;
    }

    /**
     * @returns {Hashgraph.proto.IAccountAmount}
     */
    _toProtobuf() {
        return {
            accountID:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            amount: this._amount,
            isApproval: this._isApproval != null ? this._isApproval : false,
        };
    }

    /**
     * @param {Hashgraph.proto.IAccountAmount} pb
     * @returns {AccountAmount}
     */
    static _fromProtobuf(pb) {
        return new AccountAmount({
            accountId:
                pb.accountID != null
                    ? AccountId._fromProtobuf(pb.accountID)
                    : undefined,
            amount: pb.amount != null ? pb.amount : Long.ZERO,
            isApproval: pb.isApproval != null ? pb.isApproval : false,
        });
    }
}
