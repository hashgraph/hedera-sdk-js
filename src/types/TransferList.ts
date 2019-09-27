import {AccountAmount, accountAmountToSdk} from "./AccountAmount";
import {TransferList as ProtoTransferList} from "../generated/CryptoTransfer_pb";

export function transferListToSdk(transferList: ProtoTransferList): AccountAmount[] {
    return transferList.getAccountamountsList().map((accountAmount) => {
        return accountAmountToSdk(accountAmount);
    });
}