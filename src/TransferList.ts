import { AccountAmount, accountAmountToSdk } from "./account/AccountAmount";
import { TransferList as ProtoTransferList, AccountAmount as ProtoAccountAmount } from "./generated/CryptoTransfer_pb";

export function transferListToSdk(transferList: ProtoTransferList): AccountAmount[] {
    return transferList.getAccountamountsList().map((accountAmount: ProtoAccountAmount) => accountAmountToSdk(accountAmount));
}
