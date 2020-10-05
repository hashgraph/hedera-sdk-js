import AccountId from "./account/AccountId";
import ContractId from "./contract/ContractId";
import FileId from "./file/FileId";
import TopicId from "./topic/TopicId";
import ExchangeRate from "./ExchangeRate";
import Status from "./Status";
import * as proto from "@hashgraph/proto";
import Long from "long";

/**
 * The consensus result for a transaction, which might not be currently known,
 * or may succeed or fail.
 */
export default class TransactionReceipt {
    /**
     * @private
     * @param {object} props
     * @param {Status} props.status
     * @param {?AccountId} props.accountId
     * @param {?FileId} props.fileId
     * @param {?ContractId} props.contractId
     * @param {?TopicId} props.topicId
     * @param {?ExchangeRate} props.exchangeRate
     * @param {?number} props.topicSequenceNumber
     * @param {?Uint8Array} props.topicRunningHash
     */
    constructor(props) {
        /**
         * Whether the transaction succeeded or failed (or is unknown).
         *
         * @readonly
         */
        this.status = props.status;

        /**
         * The account ID, if a new account was created.
         *
         * @readonly
         */
        this.accountId = props.accountId;

        /**
         * The file ID, if a new file was created.
         *
         * @readonly
         */
        this.fileId = props.fileId;

        /**
         * The contract ID, if a new contract was created.
         *
         * @readonly
         */
        this.contractId = props.contractId;

        /**
         * The topic ID, if a new topic was created.
         *
         * @readonly
         */
        this.topicId = props.topicId;

        /**
         * The exchange rate of Hbars to cents (USD).
         *
         * @readonly
         */
        this.exchangeRate = props.exchangeRate;

        /**
         * Updated sequence number for a consensus service topic.
         *
         * @readonly
         */
        this.topicSequenceNumber = props.topicSequenceNumber;

        /**
         * Updated running hash for a consensus service topic.
         *
         * @readonly
         */
        this.topicRunningHash = props.topicRunningHash;

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {proto.ITransactionReceipt}
     */
    _toProtobuf() {
        return {
            status: this.status.valueOf(),

            accountID:
                this.accountId != null ? this.accountId._toProtobuf() : null,
            fileID: this.fileId != null ? this.fileId._toProtobuf() : null,
            contractID:
                this.contractId != null ? this.contractId._toProtobuf() : null,
            topicID: this.topicId != null ? this.topicId._toProtobuf() : null,

            topicRunningHash:
                this.topicRunningHash == null ? null : this.topicRunningHash,

            topicSequenceNumber: this.topicSequenceNumber,

            exchangeRate: {
                nextRate: null,
                currentRate:
                    this.exchangeRate != null
                        ? this.exchangeRate._toProtobuf()
                        : null,
            },
        };
    }

    /**
     * @internal
     * @param {proto.ITransactionReceipt} receipt
     * @returns {TransactionReceipt}
     */
    static _fromProtobuf(receipt) {
        const exchangeRateSet = /** @type {proto.IExchangeRateSet} */ (receipt.exchangeRate);

        return new TransactionReceipt({
            status: Status._fromCode(
                receipt.status != null ? receipt.status : 0
            ),

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
                          /** @type {proto.IExchangeRate} */
                          (exchangeRateSet.currentRate)
                      )
                    : null,

            topicSequenceNumber:
                receipt.topicSequenceNumber instanceof Long
                    ? receipt.topicSequenceNumber.toInt()
                    : receipt.topicSequenceNumber != null
                    ? receipt.topicSequenceNumber
                    : 0,
            topicRunningHash:
                receipt.topicRunningHash != null
                    ? receipt.topicRunningHash
                    : null,
        });
    }
}
