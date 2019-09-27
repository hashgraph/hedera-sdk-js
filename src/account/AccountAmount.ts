import {AccountAmount as ProtoAccountAmount} from "../generated/CryptoTransfer_pb";
import {AccountId, accountIdToSdk} from "./AccountId";

export type AccountAmount = {
    accountId: AccountId;
    amount: string;
}

export function accountAmountToSdk(accountAmount: ProtoAccountAmount): AccountAmount {
    return {
        accountId: accountIdToSdk(accountAmount.getAccountid()!),
        amount: accountAmount.getAmount()
    }
}