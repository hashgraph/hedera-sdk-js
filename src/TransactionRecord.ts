import { TransactionReceipt } from "./TransactionReceipt";
import { ContractFunctionResult } from "./contract/ContractFunctionResult";
import { TransactionRecord as ProtoTransactionRecord } from "./generated/TransactionRecord_pb";
import { TransactionId } from "./TransactionId";
import { timestampToDate } from "./Timestamp";
import { AccountAmount, accountAmountToSdk } from "./account/AccountAmount";
import { TransferList as ProtoTransferList, AccountAmount as ProtoAccountAmount } from "./generated/CryptoTransfer_pb";
import { Time } from "./Time";
import { Hbar } from "./Hbar";

export interface TransactionRecord {
    receipt: TransactionReceipt | null;
    transactionHash: Uint8Array;
    consensusTimestamp: Time;
    transactionId: TransactionId;
    transactionMemo: string;
    transactionFee: Hbar;
    contractCallResult: ContractFunctionResult | null;
    contractCreateResult: ContractFunctionResult | null;
    transfers: AccountAmount[];
}

export function recordListToSdk(records: ProtoTransactionRecord[]): TransactionRecord[] {
    return records.map((record) => ({
        receipt: TransactionReceipt._fromProto(record.getReceipt()!),
        transactionHash: record.getTransactionhash_asU8(),
        consensusTimestamp: Time.fromProto(record.getConsensustimestamp()!),
        transactionId: TransactionId._fromProto(record.getTransactionid()!),
        transactionMemo: record.getMemo(),
        transactionFee: Hbar.fromTinybar(record.getTransactionfee()),

        contractCallResult: record.hasContractcallresult() ?
            new ContractFunctionResult(record.getContractcallresult()!) :
            null,

        contractCreateResult: record.hasContractcreateresult() ?
            new ContractFunctionResult(record.getContractcreateresult()!) :
            null,

        transfers: transferListToSdk(record.getTransferlist()!)
    }));
}

export function transferListToSdk(transferList: ProtoTransferList): AccountAmount[] {
    /* eslint-disable-next-line max-len */
    return transferList.getAccountamountsList().map((accountAmount: ProtoAccountAmount) => accountAmountToSdk(accountAmount));
}
