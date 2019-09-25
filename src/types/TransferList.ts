import {AccountAmount, accountAmountToSdk} from "./AccountAmount";
import {TransferList as ProtoTransferList} from "../generated/CryptoTransfer_pb";

export type TransferList = {
    accountAmountsList: AccountAmount[];
}

export function transferListToSdk(transferList: ProtoTransferList): TransferList {
    const accountAmountsList = transferList.getAccountamountsList().map((accountAmount) => {
        return accountAmountToSdk(accountAmount);
    });

    return {
        accountAmountsList
    }
}