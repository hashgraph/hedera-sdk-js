import AccountId from "./account/AccountId";
import ContractId from "./contract/ContractId";
import FileId from "./file/FileId";
import TopicId from "./topic/TopicId";
import ExchangeRate from "./ExchangeRate";
import Status from "./Status";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * The consensus result for a transaction, which might not be currently known,
 * or may  succeed or fail.
 */
export default class TransactionReceipt {
    /**
     * @param {object} properties
     * @param {Status} properties.status
     * @param {AccountId | null} properties.accountId
     * @param {FileId | null} properties.fileId
     * @param {ContractId | null} properties.contractId
     * @param {TopicId | null} properties.topicId
     * @param {ExchangeRate | null} properties.exchangeRate
     * @param {number} properties.topicSequenceNubmer
     * @param {Uint8Array} properties.topicRunningHash
     */
    constructor(properties) {
        /**
         * Whether the transaction succeeded or failed (or is unknown).
         */
        this.status = properties.status;

        this._accountId = properties.accountId;
        this._fileId = properties.fileId;
        this._contractId = properties.contractId;
        this._topicId = properties.topicId;
        this._exchangeRate = properties.exchangeRate;
        this._topicSequenceNumber = properties.topicSequenceNubmer;
        this._topicRunningHash = properties.topicRunningHash;
    }

    /**
     * The account ID, if a new account was created.
     *
     * @returns {AccountId}
     */
    getAccountId() {
        if (this._accountId == null) {
            throw new Error("receipt does not contain an account ID");
        }

        return this._accountId;
    }

    /**
     * The file ID, if a new file was created.
     *
     * @returns {FileId}
     */
    getFileId() {
        if (this._fileId == null) {
            throw new Error("receipt does not contain a file ID");
        }

        return this._fileId;
    }

    /**
     * The contract ID, if a new smart contract instance was created.
     *
     * @returns {ContractId}
     */
    getContractId() {
        if (this._contractId == null) {
            throw new Error("receipt does not contain a contract ID");
        }

        return this._contractId;
    }

    /**
     * TopicID of a newly created consensus service topic.
     *
     * @returns {TopicId}
     */
    getTopicId() {
        if (this._topicId == null) {
            throw new Error("receipt does not contain a topic ID");
        }

        return this._topicId;
    }

    /**
     * Updated running hash for a consensus service topic. The result of a ConsensusSubmitMessage.
     *
     * @returns {Uint8Array}
     */
    getConsensusTopicRunningHash() {
        if (this._topicRunningHash.byteLength === 0) {
            throw new Error(
                "receipt was not for a consensus topic transaction"
            );
        }

        return this._topicRunningHash;
    }

    /**
     * Updated sequence number for a consensus service topic. The result of a ConsensusSubmitMessage.
     *
     * @returns {number}
     */
    getConsensusTopicSequenceNumber() {
        if (this._topicSequenceNumber === 0) {
            throw new Error(
                "receipt was not for a consensus topic transaction"
            );
        }

        return this._topicSequenceNumber;
    }

    /**
     * @returns {object}
     */
    toJSON() {
        return {
            status: this.status.toString(),
            accountId: this._accountId?.toString(),
            fileId: this._fileId?.toString(),
            contractId: this._contractId?.toString(),
            consensusTopicId: this._topicId?.toString(),
            consensusTopicRunningHash:
                this._topicRunningHash.byteLength === 0
                    ? /* eslint-disable-next-line no-undefined */
                      undefined
                    : this._topicRunningHash.toString(),
            consensusTopicSequenceNumber:
                this._topicSequenceNumber === 0
                    ? /* eslint-disable-next-line no-undefined */
                      undefined
                    : this._topicSequenceNumber,
        };
    }

    /**
     * @protected
     * @returns {proto.ITransactionReceipt}
     */
    _toProtobuf() {
        return {
            status: this.status._toProtobuf(),
            accountID: this._accountId?._toProtobuf(),
            fileID: this._fileId?._toProtobuf(),
            contractID: this._contractId?._toProtobuf(),
            topicID: this._topicId?._toProtobuf(),
            topicRunningHash:
                this._topicRunningHash.byteLength === 0
                    ? null
                    : this._topicRunningHash,
            topicSequenceNumber: this._topicSequenceNumber,
            exchangeRate: {
                nextRate: null,
                currentRate: this._exchangeRate?._toProtobuf(),
            },
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON(), null, 2);
    }

    /**
     * @param {proto.ITransactionReceipt} receipt
     * @returns {TransactionReceipt}
     */
    static _fromProtobuf(receipt) {
        return new TransactionReceipt({
            // @ts-ignore
            status: Status._fromCode(receipt.status),
            accountId:
                receipt.accountID != null
                    ? AccountId._fromProtobuf(receipt.accountID)
                    : null,
            fileId:
                receipt.fileID != null
                    ? FileId._fromProtobuf(receipt.fileID)
                    : null,
            contractId:
                receipt.contractID != null
                    ? ContractId._fromProtobuf(receipt.contractID)
                    : null,
            topicId:
                receipt.topicID != null
                    ? TopicId._fromProtobuf(receipt.topicID)
                    : null,
            exchangeRate:
                receipt.exchangeRate != null
                    ? ExchangeRate._fromProtobuf(
                          // @ts-ignore
                          receipt.exchangeRate.currentRate
                      )
                    : null,
            topicSequenceNubmer:
                receipt.topicSequenceNumber instanceof Long
                    ? receipt.topicSequenceNumber.toInt()
                    : receipt.topicSequenceNumber ?? 0,
            topicRunningHash: receipt.topicRunningHash ?? new Uint8Array(),
        });
    }
}
