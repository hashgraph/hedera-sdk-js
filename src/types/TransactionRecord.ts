import {receiptToSdk, TransactionReceipt} from "./TransactionReceipt";
import {ContractFunctionResult, contractFunctionResultToSdk} from "./ContractFunctionResult";
import {transferListToSdk} from "./TransferList";
import {TransactionRecord as ProtoTransactionRecord} from "../generated/TransactionRecord_pb";
import {TransactionId, transactionIdToSdk} from "./TransactionId";
import {timestampToDate} from "./Timestamp";
import {AccountAmount} from "./AccountAmount";

export type TransactionRecord = {
    receipt: TransactionReceipt | null;
    transactionHash: Uint8Array | string;
    consensusTimestamp: Date;
    transactionId: TransactionId;
    memo: string;
    transactionFee: number;
    contractCallResult: ContractFunctionResult | null;
    contractCreateResult: ContractFunctionResult | null;
    transferList: AccountAmount[] | null;
}

export function recordListToSdk(records: ProtoTransactionRecord[]): TransactionRecord[] {
    return records.map((record) => {
        return {
            receipt: receiptToSdk(record.getReceipt()!),
            transactionHash: record.getTransactionhash(),
            consensusTimestamp: timestampToDate(record.getConsensustimestamp()!),
            transactionId: transactionIdToSdk(record.getTransactionid()!),
            memo: record.getMemo(),
            transactionFee: record.getTransactionfee(),
            contractCallResult: record.getContractcallresult() == null ? null : contractFunctionResultToSdk(record.getContractcallresult()!),
            contractCreateResult: record.getContractcreateresult() == null ? null : contractFunctionResultToSdk(record.getContractcreateresult()!),
            transferList: record.getTransferlist() == null ? null : transferListToSdk(record.getTransferlist()!)
        }
    });
}