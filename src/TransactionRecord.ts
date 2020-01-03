import { TransactionReceipt } from "./TransactionReceipt";
import { ContractFunctionResult } from "./contract/ContractFunctionResult";
import { TransactionRecord as ProtoTransactionRecord } from "./generated/TransactionRecord_pb";
import { TransactionId } from "./TransactionId";
import { TransferList as ProtoTransferList } from "./generated/CryptoTransfer_pb";
import { Time } from "./Time";
import { Hbar } from "./Hbar";
import { Transfer, transferFromProto } from "./Transfer";

export class TransactionRecord {
    private readonly _callResult: ContractFunctionResult | null = null;

    private readonly _callResultIsCreate: boolean = false;

    public readonly receipt: TransactionReceipt | null;

    public readonly transactionHash: Uint8Array;

    public readonly consensusTimestamp: Time;

    public readonly transactionId: TransactionId;

    public readonly transactionMemo: string;

    public readonly transactionFee: Hbar;

    public readonly transfers: Transfer[];

    private constructor(record: ProtoTransactionRecord) {
        this.receipt = TransactionReceipt._fromProto(record.getReceipt()!);
        this.transactionHash = record.getTransactionhash_asU8();
        this.consensusTimestamp = Time._fromProto(record.getConsensustimestamp()!);
        this.transactionId = TransactionId._fromProto(record.getTransactionid()!);
        this.transactionMemo = record.getMemo();
        this.transactionFee = Hbar.fromTinybar(record.getTransactionfee());
        this.transfers = transferListToSdk(record.getTransferlist()!);

        if (record.hasContractcallresult()) {
            this._callResult = new ContractFunctionResult(record.getContractcreateresult()!);
            this._callResultIsCreate = true;
        } else if (record.hasContractcreateresult()) {
            this._callResult = new ContractFunctionResult(record.getContractcallresult()!);
        }
    }

    public static _fromProto(pb: ProtoTransactionRecord): TransactionRecord {
        return new TransactionRecord(pb);
    }

    public getContractCreateResult(): ContractFunctionResult {
        if (this._callResult == null || this._callResultIsCreate) {
            throw new Error("record does not contain a contract create result");
        }

        return this._callResult;
    }

    public getContractExecuteResult(): ContractFunctionResult {
        if (this._callResult == null || !this._callResultIsCreate) {
            throw new Error("record does not contain a contract execute result");
        }

        return this._callResult;
    }
}

export function transferListToSdk(transferList: ProtoTransferList): Transfer[] {
    return transferList.getAccountamountsList().map(transferFromProto);
}
