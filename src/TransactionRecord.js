import TransactionReceipt from "./TransactionReceipt";
import TransactionId from "./TransactionId";
import Timestamp from "./Timestamp";
import Hbar from "./Hbar";
import Transfer from "./Transfer";
import proto from "@hashgraph/proto";
import ContractFunctionResult from "./contract/ContractFunctionResult";

/**
 * Response when the client sends the node TransactionGetRecordResponse.
 */
export default class TransactionRecord {
    /**
     * @private
     * @param {object} properties
     * @param {ContractFunctionResult} [properties.contractFunctionResult]
     * @param {TransactionReceipt} properties.receipt
     * @param {Uint8Array} properties.transactionHash
     * @param {Timestamp} properties.consensusTimestampstamp
     * @param {TransactionId} properties.transactionId
     * @param {string} properties.transactionMemo
     * @param {Hbar} properties.transactionFee
     * @param {Transfer[]} properties.transfers
     */
    constructor(properties) {
        /**
         * The status (reach consensus, or failed, or is unknown) and the ID of
         * any new account/file/instance created.
         *
         * @readonly
         */
        this.receipt = properties.receipt;

        /**
         * The hash of the Transaction that executed (not the hash of any Transaction that failed
         * for having a duplicate TransactionID).
         *
         * @readonly
         */
        this.transactionHash = properties.transactionHash;

        /**
         * The consensus timestamp (or null if didn't reach consensus yet).
         *
         * @readonly
         */
        this.consensusTimestampstamp = properties.consensusTimestampstamp;

        /**
         * The ID of the transaction this record represents.
         *
         * @readonly
         */
        this.transactionId = properties.transactionId;

        /**
         * The memo that was submitted as part of the transaction (max 100 bytes).
         *
         * @readonly
         */
        this.transactionMemo = properties.transactionMemo;

        /**
         * The actual transaction fee charged,
         * not the original transactionFee value from TransactionBody.
         *
         * @readonly
         */
        this.transactionFee = properties.transactionFee;

        /**
         * All hbar transfers as a result of this transaction, such as fees, or transfers performed
         * by the transaction, or by a smart contract it calls, or by the creation of threshold
         * records that it triggers.
         *
         * @readonly
         */
        this.transfers = properties.transfers;

        /**
         * Record of the value returned by the smart contract function or constructor.
         *
         * @readonly
         */
        this.contractFunctionResult =
            properties.contractFunctionResult != null
                ? properties.contractFunctionResult
                : null;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ITransactionRecord} record
     * @returns {TransactionRecord}
     */
    static _fromProtobuf(record) {
        const contractFunctionResult =
            record.contractCallResult != null
                ? ContractFunctionResult._fromProtobuf(
                      record.contractCallResult
                  )
                : record.contractCreateResult != null
                ? ContractFunctionResult._fromProtobuf(
                      record.contractCreateResult
                  )
                : undefined;

        return new TransactionRecord({
            receipt: TransactionReceipt._fromProtobuf(
                /** @type {proto.ITransactionReceipt} */ (record.receipt)
            ),
            transactionHash:
                record.transactionHash != null
                    ? record.transactionHash
                    : new Uint8Array(),
            consensusTimestampstamp: Timestamp._fromProtobuf(
                /** @type {proto.ITimestamp} */
                (record.consensusTimestamp)
            ),
            transactionId: TransactionId._fromProtobuf(
                /** @type {proto.ITransactionID} */ (record.transactionID)
            ),
            transactionMemo: record.memo != null ? record.memo : "",
            transactionFee: Hbar.fromTinybars(
                record.transactionFee != null ? record.transactionFee : 0
            ),
            transfers: (record.transferList != null
                ? record.transferList.accountAmounts != null
                    ? record.transferList.accountAmounts
                    : []
                : []
            ).map((aa) => Transfer._fromProtobuf(aa)),
            contractFunctionResult,
        });
    }
}
