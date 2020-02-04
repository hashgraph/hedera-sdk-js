import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId } from "./account/AccountId";
import { ConsensusTopicId } from "./consensus/ConsensusTopicId";
import { ContractId } from "./contract/ContractId";
import { FileId } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";
import { Status } from "./Status";

export class TransactionReceipt {
    public readonly status: Status;
    private _accountId: AccountId | null;
    private _fileId: FileId | null;
    private _contractId: ContractId | null;
    private _topicId: ConsensusTopicId | null;
    private readonly _exchangeRateSet: ExchangeRateSet | null;
    public readonly topicSequenceNubmer: number;
    public readonly topicRunningHash: Uint8Array;

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
        this.topicSequenceNubmer = topicSequenceNubmer;
        this.topicRunningHash = topicRunningHash;
    }

    public getAccountId(): AccountId {
        return this._accountId!;
    }

    public getFileId(): FileId {
        return this._fileId!;
    }

    public getContractId(): ContractId {
        return this._contractId!;
    }

    public getTopicId(): ConsensusTopicId {
        return this._topicId!;
    }

    // NOT A STABLE API
    public static _fromProto(receipt: ProtoTransactionReceipt): TransactionReceipt {
        return new TransactionReceipt(
            new Status(receipt.getStatus()),
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
