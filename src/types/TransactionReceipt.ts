import {ExchangeRateSet, exchangeRateSetToSdk} from "./ExchangeRateSet";
import {TransactionReceipt as ProtoTransactionReceipt} from "../generated/TransactionReceipt_pb";
import {AccountId, accountIdToSdk} from "./AccountId";
import {ContractId, contractIdToSdk} from "./ContractId";
import {FileId, fileIdToSdk} from "./FileId";

export type TransactionReceipt = {
    status: number;
    accountId: AccountId | null;
    fileId: FileId | null;
    contractId: ContractId | null;
    exchangeRateSet: ExchangeRateSet | null;
}

export function receiptToSdk(receipt: ProtoTransactionReceipt): TransactionReceipt {
    return {
        status: receipt.getStatus(),
        accountId: receipt.getAccountid() == null ? null : accountIdToSdk(receipt.getAccountid()!),
        fileId: receipt.getContractid() == null ? null : fileIdToSdk(receipt.getFileid()!),
        contractId: receipt.getFileid() == null ? null : contractIdToSdk(receipt.getContractid()!),
        exchangeRateSet: receipt.getExchangerate() == null ? null : exchangeRateSetToSdk(receipt.getExchangerate()!)
    }
}