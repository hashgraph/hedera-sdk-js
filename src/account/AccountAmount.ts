import { AccountAmount as ProtoAccountAmount } from "../generated/CryptoTransfer_pb";
import { AccountId } from "./AccountId";
import { Hbar } from "../Hbar";

export interface AccountAmount {
    accountId: AccountId;
    amount: Hbar;
}

export function accountAmountToSdk(accountAmount: ProtoAccountAmount): AccountAmount {
    return {
        accountId: AccountId._fromProto(accountAmount.getAccountid()!),
        amount: Hbar.fromTinybar(accountAmount.getAmount())
    };
}
