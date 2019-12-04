import { AccountAmount as ProtoAccountAmount } from "../generated/CryptoTransfer_pb";
import { AccountId } from "./AccountId";

export type AccountAmount = {
    accountId: AccountId;
    amount: string;
}

export function accountAmountToSdk(accountAmount: ProtoAccountAmount): AccountAmount {
    return {
        accountId: AccountId.fromProto(accountAmount.getAccountid()!),
        amount: accountAmount.getAmount()
    };
}
