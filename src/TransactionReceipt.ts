import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId } from "./account/AccountId";
import { ConsensusTopicId } from "./consensus/ConsensusTopicId";
import { ContractId } from "./contract/ContractId";
import { FileId } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";
import { Status } from "./Status";

/**
 * The consensus result for a transaction, which might not be currently known,
 * or may  succeed or fail.
 */
export class TransactionReceipt {
    /**
     * Whether the transaction succeeded or failed (or is unknown).
     */
    public readonly status: Status;

    private readonly [ "_accountId" ]: AccountId | null;
    private readonly [ "_fileId" ]: FileId | null;
    private readonly [ "_contractId" ]: ContractId | null;
    private readonly [ "_topicId" ]: ConsensusTopicId | null;
    private readonly [ "_exchangeRateSet" ]: ExchangeRateSet | null;
    private readonly [ "_topicSequenceNumber" ]: number;
    private readonly [ "_topicRunningHash" ]: Uint8Array;

    private constructor(
        status: Status,
        accountId: AccountId | null,
        fileId: FileId | null,
        contractId: ContractId | null,
        topicId: ConsensusTopicId | null,
        exchangeRateSet: ExchangeRateSet | null,
        topicSequenceNubmer: number,
        topicRunningHash: Uint8Array
    ) {
        this.status = status;
        this._accountId = accountId;
        this._fileId = fileId;
        this._contractId = contractId;
        this._topicId = topicId;
        this._exchangeRateSet = exchangeRateSet;
        this._topicSequenceNumber = topicSequenceNubmer;
        this._topicRunningHash = topicRunningHash;
    }

    /** @deprecated */
    public get accountId(): AccountId {
        console.warn("`TransactionReceipt.accountId` is deprecrated. Use `TransactionReceipt.getAccountId()` instead.");
        return this.getAccountId();
    }

    /**
     * The account ID, if a new account was created.
     */
    public getAccountId(): AccountId {
        if (this._accountId == null) {
            throw new Error("receipt does not contain an account ID");
        }

        return this._accountId!;
    }

    /** @deprecated */
    public get fileId(): FileId {
        console.warn("`TransactionReceipt.fileId` is deprecrated. Use `TransactionReceipt.getfileId()` instead.");
        return this.getFileId();
    }

    /**
     * The file ID, if a new file was created.
     */
    public getFileId(): FileId {
        if (this._fileId == null) {
            throw new Error("receipt does not contain a file ID");
        }

        return this._fileId!;
    }

    /** @deprecated */
    public get contractId(): ContractId {
        console.warn("`TransactionReceipt.contractId` is deprecrated. Use `TransactionReceipt.getcontractId()` instead.");
        return this.getContractId();
    }

    /**
     * The contract ID, if a new smart contract instance was created.
     */
    public getContractId(): ContractId {
        if (this._contractId == null) {
            throw new Error("receipt does not contain a contract ID");
        }

        return this._contractId!;
    }

    /**
     * TopicID of a newly created consensus service topic.
     */
    public getConsensusTopicId(): ConsensusTopicId {
        if (this._topicId == null) {
            throw new Error("receipt does not contain a topic ID");
        }

        return this._topicId!;
    }

    /** @deprecated `TransactionReceipt.getTopicId()` is deprecrated. Use `TransactionReceipt.getConsensusTopicId()` instead. */
    public getTopicId(): ConsensusTopicId {
        console.warn("`TransactionReceipt.getTopicId()` is deprecrated. Use `TransactionReceipt.getConsensusTopicId()` instead.");
        return this.getConsensusTopicId();
    }

    /**
     * Updated running hash for a consensus service topic. The result of a ConsensusSubmitMessage.
     */
    public getConsensusTopicRunningHash(): Uint8Array {
        if (this._topicRunningHash.byteLength === 0) {
            throw new Error("receipt was not for a consensus topic transaction");
        }

        return this._topicRunningHash;
    }

    /**
     * Updated sequence number for a consensus service topic. The result of a ConsensusSubmitMessage.
     */
    public getConsensusTopicSequenceNumber(): number {
        if (this._topicSequenceNumber === 0) {
            throw new Error("receipt was not for a consensus topic transaction");
        }

        return this._topicSequenceNumber;
    }

    public toJSON(): object {
        return {
            status: this.status.toString(),
            accountId: this._accountId?.toString(),
            fileId: this._fileId?.toString(),
            contractId: this._contractId?.toString(),
            consensusTopicId: this._topicId?.toString(),
            consensusTopicRunningHash: this._topicRunningHash.byteLength === 0 ?
            /* eslint-disable-next-line no-undefined */
                undefined :
                this._topicRunningHash.toString(),
            consensusTopicSequenceNumber: this._topicSequenceNumber === 0 ?
            /* eslint-disable-next-line no-undefined */
                undefined :
                this._topicSequenceNumber
        };
    }

    public toString(): string {
        return JSON.stringify(this.toJSON(), null, 2);
    }

    // NOT A STABLE API
    public static _fromProto(receipt: ProtoTransactionReceipt): TransactionReceipt {
        return new TransactionReceipt(
            Status._fromCode(receipt.getStatus()),
            receipt.hasAccountid() ? AccountId._fromProto(receipt.getAccountid()!) : null,
            receipt.hasFileid() ? FileId._fromProto(receipt.getFileid()!) : null,
            receipt.hasContractid() ?
                ContractId._fromProto(receipt.getContractid()!) :
                null,
            receipt.hasTopicid() ?
                ConsensusTopicId._fromProto(receipt.getTopicid()!) :
                null,
            receipt.hasExchangerate() ?
                exchangeRateSetToSdk(receipt.getExchangerate()!) :
                null,
            receipt.getTopicsequencenumber(),
            receipt.getTopicrunninghash_asU8()
        );
    }
}
