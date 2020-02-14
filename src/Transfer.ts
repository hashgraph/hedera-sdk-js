import { AccountAmount as ProtoAccountAmount } from "./generated/CryptoTransfer_pb";
import { AccountId } from "./account/AccountId";
import { Hbar } from "./Hbar";

/**
 * An account, and the amount that it sends or receives during a cryptocurrency transfer.
 */
export interface Transfer {
    /**
     * The Account ID that sends or receives cryptocurrency.
     */
    accountId: AccountId;

    /**
     * The amount of tinybars that the account sends(negative) or receives(positive).
     */
    amount: Hbar;
}

export function transferFromProto(accountAmount: ProtoAccountAmount): Transfer {
    return {
        accountId: AccountId._fromProto(accountAmount.getAccountid()!),
        amount: Hbar.fromTinybar(accountAmount.getAmount())
    };
}
