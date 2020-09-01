import AccountId from "./account/AccountId";
import Hbar from "./Hbar";
import proto from "@hashgraph/proto";

/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
export default class Transfer {
    /**
     * @private
     * @param {AccountId} accountId
     * @param {Hbar} amount
     */
    constructor(accountId, amount) {
        /**
         * The Account ID that sends or receives cryptocurrency.
         */
        this.accountId = accountId;

        /**
         * The amount of tinybars that the account sends(negative) or receives(positive).
         */
        this.amount = amount;

        Object.freeze(this);
    }

    /**
     * @param {proto.IAccountAmount} transfer
     * @returns {Transfer}
     */
    static _fromProtobuf(transfer) {
        return new Transfer(
            // @ts-ignore
            AccountId._fromProtobuf(transfer.accountID),
            Hbar.fromTinybars(transfer.amount ?? 0)
        );
    }

    /**
     * @returns {proto.IAccountAmount}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            amount: this.amount._toProtobuf(),
        };
    }
}
