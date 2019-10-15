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
    const exchangeRate = receipt.getExchangerate();
    return {
        status: receipt.getStatus(),
        accountId: receipt.getAccountid() && accountIdToSdk(receipt.getAccountid()!),
        fileId: receipt.getFileid() && fileIdToSdk(receipt.getFileid()!),
        contractId: receipt.getContractid() && contractIdToSdk(receipt.getContractid()!),
        exchangeRateSet: exchangeRate && exchangeRateSetToSdk(exchangeRate!)
    };
}
