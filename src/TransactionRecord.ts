import { receiptToSdk, TransactionReceipt } from "./TransactionReceipt";
import { ContractFunctionResult, contractFunctionResultToSdk } from "./contract/ContractFunctionResult";
import { TransactionRecord as ProtoTransactionRecord } from "./generated/TransactionRecord_pb";
import { TransactionId } from "./TransactionId";
import { timestampToDate } from "./Timestamp";
import { AccountAmount, accountAmountToSdk } from "./account/AccountAmount";
import { TransferList as ProtoTransferList, AccountAmount as ProtoAccountAmount } from "./generated/CryptoTransfer_pb";

export interface TransactionRecord {
    receipt?: TransactionReceipt;
    transactionHash: Uint8Array | string;
    consensusTimestamp: Date;
    transactionId: TransactionId;
    memo: string;
    transactionFee: number;
    contractCallResult?: ContractFunctionResult;
    contractCreateResult?: ContractFunctionResult;
    transferList?: AccountAmount[];
}

export function recordListToSdk(records: ProtoTransactionRecord[]): TransactionRecord[] {
    return records.map((record) => {
        const callResult = record.getContractcallresult();
        const createResult = record.getContractcreateresult();

        return {
            receipt: receiptToSdk(record.getReceipt()!),
            transactionHash: record.getTransactionhash(),
            consensusTimestamp: timestampToDate(record.getConsensustimestamp()!),
            transactionId: TransactionId._fromProto(record.getTransactionid()!),
            memo: record.getMemo(),
            transactionFee: record.getTransactionfee(),
            contractCallResult: callResult && contractFunctionResultToSdk(callResult),
            contractCreateResult: createResult && contractFunctionResultToSdk(createResult),
            transferList: record.getTransferlist() && transferListToSdk(record.getTransferlist()!)
        };
    });
}

export function transferListToSdk(transferList: ProtoTransferList): AccountAmount[] {
    /* eslint-disable-next-line max-len */
    return transferList.getAccountamountsList().map((accountAmount: ProtoAccountAmount) => accountAmountToSdk(accountAmount));
}
