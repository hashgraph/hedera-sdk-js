import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId } from "./account/AccountId";
import { ContractId } from "./contract/ContractId";
import { FileId } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";

export interface TransactionReceipt {
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
        accountId: receipt.getAccountid() && AccountId._fromProto(receipt.getAccountid()!),
        fileId: receipt.getFileid() && FileId._fromProto(receipt.getFileid()!),
        contractId: receipt.getContractid() && ContractId._fromProto(receipt.getContractid()!),
        exchangeRateSet: exchangeRate && exchangeRateSetToSdk(exchangeRate)
    };
}
