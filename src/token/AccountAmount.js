/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.AccountAmount} Hashgraph.proto.AccountAmount
 */

import Long from "long";
import { AccountId } from "../exports.js";

export default class AccountAmount {
    /**
     * @param {object} props
     * @param {AccountId} [props.accountId]
     * @param {Long} [props.amount]
     * @param {boolean} [props.isApproval]
     */
    constructor(props = {}) {
        this._accountId = null;
        this._amount = null;
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
     * @returns {Long?}
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
     * @returns {Hashgraph.proto.AccountAmount}
     */
    _toProtobuf() {
        return {
            accountID:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            amount: this._amount != null ? this._amount : Long.ZERO,
            isApproval: this._isApproval != null ? this._isApproval : false,
        };
    }

    /**
     * @param {Hashgraph.proto.AccountAmount} pb
     * @returns {AccountAmount}
     */
    static _fromProtobuf(pb) {
        return new AccountAmount({
            accountId:
                pb.accountID != null
                    ? AccountId._fromProtobuf(pb.accountID)
                    : undefined,
            amount: pb.amount,
            isApproval: pb.isApproval,
        });
    }
}
