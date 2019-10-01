import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId, accountIdToSdk } from "./account/AccountId";
import { ContractId, contractIdToSdk } from "./contract/ContractId";
import { FileId, fileIdToSdk } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";

export type TransactionReceipt = {
    status: number;
    accountId?: AccountId;
    fileId?: FileId;
    contractId?: ContractId;
    exchangeRateSet?: ExchangeRateSet;
}

export function receiptToSdk(receipt: ProtoTransactionReceipt): TransactionReceipt {
    return {
        status: receipt.getStatus(),
        accountId: receipt.getAccountid() && accountIdToSdk(receipt.getAccountid()!),
        fileId: receipt.getContractid() && fileIdToSdk(receipt.getFileid()!),
        contractId: receipt.getFileid() && contractIdToSdk(receipt.getContractid()!),
        exchangeRateSet: receipt.getExchangerate() && exchangeRateSetToSdk(receipt.getExchangerate()!)
    };
}
