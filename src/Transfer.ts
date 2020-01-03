import { AccountAmount as ProtoAccountAmount } from "./generated/CryptoTransfer_pb";
import { AccountId } from "./account/AccountId";
import { Hbar } from "./Hbar";

export interface Transfer {
    accountId: AccountId;
    amount: Hbar;
}

export function transferFromProto(accountAmount: ProtoAccountAmount): Transfer {
    return {
        accountId: AccountId._fromProto(accountAmount.getAccountid()!),
        amount: Hbar.fromTinybar(accountAmount.getAmount())
    };
}
