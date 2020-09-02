import AccountId from "./account/AccountId";
import Hbar from "./Hbar";
import proto from "@hashgraph/proto";

/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
export default class Transfer {
    /**
     * @internal
     * @param {object} properties
     * @param {AccountId} properties.accountId
     * @param {Hbar} properties.amount
     */
    constructor(properties) {
        /**
         * The Account ID that sends or receives cryptocurrency.
         *
         * @readonly
         */
        this.accountId = properties.accountId;

        /**
         * The amount of tinybars that the account sends(negative) or receives(positive).
         *
         * @readonly
         */
        this.amount = properties.amount;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IAccountAmount} transfer
     * @returns {Transfer}
     */
    static _fromProtobuf(transfer) {
        return new Transfer({
            // @ts-ignore
            accountId: AccountId._fromProtobuf(transfer.accountID),
            amount: Hbar.fromTinybars(transfer.amount ?? 0),
        });
    }

    /**
     * @internal
     * @returns {proto.IAccountAmount}
     */
    _toProtobuf() {
        return {
            accountID: this.accountId._toProtobuf(),
            amount: this.amount.toTinybars(),
        };
    }
}
