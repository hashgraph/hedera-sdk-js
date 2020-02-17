import { TransactionReceipt } from "./TransactionReceipt";
import { ContractFunctionResult } from "./contract/ContractFunctionResult";
import { TransactionRecord as ProtoTransactionRecord } from "./generated/TransactionRecord_pb";
import { TransactionId } from "./TransactionId";
import { TransferList as ProtoTransferList } from "./generated/CryptoTransfer_pb";
import { Time } from "./Time";
import { Hbar } from "./Hbar";
import { Transfer, transferFromProto } from "./Transfer";

const callResult = Symbol("callResult");

const callResultIsCreate = Symbol("callResultIsCreate");

/**
 * Response when the client sends the node TransactionGetRecordResponse.
 */
export class TransactionRecord {
    private readonly [ callResult ]: ContractFunctionResult | null = null;

    private readonly [ callResultIsCreate ]: boolean = false;

    /**
     * The status (reach consensus, or failed, or is unknown) and the ID of
     * any new account/file/instance created.
     */
    public readonly receipt: TransactionReceipt | null;

    /**
     * The hash of the Transaction that executed (not the hash of any Transaction that failed
     * for having a duplicate TransactionID).
     */
    public readonly transactionHash: Uint8Array;

    /**
     * The consensus timestamp (or null if didn't reach consensus yet).
     */
    public readonly consensusTimestamp: Time;

    /**
     * The ID of the transaction this record represents.
     */
    public readonly transactionId: TransactionId;

    /**
     * The memo that was submitted as part of the transaction (max 100 bytes).
     */
    public readonly transactionMemo: string;

    /**
     * The actual transaction fee charged,
     * not the original transactionFee value from TransactionBody.
     */
    public readonly transactionFee: Hbar;

    /**
     * All hbar transfers as a result of this transaction, such as fees, or transfers performed
     * by the transaction, or by a smart contract it calls, or by the creation of threshold
     * records that it triggers.
     */
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
            this[ callResult ] = new ContractFunctionResult(record.getContractcallresult()!);
            this[ callResultIsCreate ] = true;
        } else if (record.hasContractcreateresult()) {
            this[ callResult ] = new ContractFunctionResult(record.getContractcreateresult()!);
        }
    }

    public static _fromProto(pb: ProtoTransactionRecord): TransactionRecord {
        return new TransactionRecord(pb);
    }

    public getContractCreateResult(): ContractFunctionResult {
        if (this[ callResult ] == null || this[ callResultIsCreate ]) {
            throw new Error("record does not contain a contract create result");
        }

        return this[ callResult ]!;
    }

    public getContractExecuteResult(): ContractFunctionResult {
        if (this[ callResult ] == null || !this[ callResultIsCreate ]) {
            throw new Error("record does not contain a contract execute result");
        }

        return this[ callResult ]!;
    }
}

export function transferListToSdk(transferList: ProtoTransferList): Transfer[] {
    return transferList.getAccountamountsList().map(transferFromProto);
}
