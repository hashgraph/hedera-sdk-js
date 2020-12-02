import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import Timestamp from "../Timestamp.js";
import Hbar from "../Hbar.js";
import Transfer from "../Transfer.js";
import ContractFunctionResult from "../contract/ContractFunctionResult.js";
import TokenTransferMap from "../account/TokenTransferMap.js";
import * as proto from "@hashgraph/proto";

/**
 * Response when the client sends the node TransactionGetRecordResponse.
 */
export default class TransactionRecord {
    /**
     * @private
     * @param {object} props
     * @param {ContractFunctionResult} [props.contractFunctionResult]
     * @param {TransactionReceipt} props.receipt
     * @param {Uint8Array} props.transactionHash
     * @param {Timestamp} props.consensusTimestampstamp
     * @param {TransactionId} props.transactionId
     * @param {string} props.transactionMemo
     * @param {Hbar} props.transactionFee
     * @param {Transfer[]} props.transfers
     * @param {TokenTransferMap} props.tokenTransfers
     */
    constructor(props) {
        /**
         * The status (reach consensus, or failed, or is unknown) and the ID of
         * any new account/file/instance created.
         *
         * @readonly
         */
        this.receipt = props.receipt;

        /**
         * The hash of the Transaction that executed (not the hash of any Transaction that failed
         * for having a duplicate TransactionID).
         *
         * @readonly
         */
        this.transactionHash = props.transactionHash;

        /**
         * The consensus timestamp (or null if didn't reach consensus yet).
         *
         * @readonly
         */
        this.consensusTimestampstamp = props.consensusTimestampstamp;

        /**
         * The ID of the transaction this record represents.
         *
         * @readonly
         */
        this.transactionId = props.transactionId;

        /**
         * The memo that was submitted as part of the transaction (max 100 bytes).
         *
         * @readonly
         */
        this.transactionMemo = props.transactionMemo;

        /**
         * The actual transaction fee charged,
         * not the original transactionFee value from TransactionBody.
         *
         * @readonly
         */
        this.transactionFee = props.transactionFee;

        /**
         * All hbar transfers as a result of this transaction, such as fees, or transfers performed
         * by the transaction, or by a smart contract it calls, or by the creation of threshold
         * records that it triggers.
         *
         * @readonly
         */
        this.transfers = props.transfers;

        /**
         * Record of the value returned by the smart contract function or constructor.
         *
         * @readonly
         */
        this.contractFunctionResult =
            props.contractFunctionResult != null
                ? props.contractFunctionResult
                : null;

        /**
         * All the token transfers from this account
         *
         * @readonly
         */
        this.tokenTransfers = props.tokenTransfers;

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {proto.ITransactionRecord}
     */
    _toProtobuf() {
        return {
            receipt: this.receipt._toProtobuf(),

            transactionHash:
                this.transactionHash != null ? this.transactionHash : null,
            consensusTimestamp:
                this.consensusTimestampstamp != null
                    ? this.consensusTimestampstamp._toProtobuf()
                    : null,
            transactionID:
                this.transactionId != null
                    ? this.transactionId._toProtobuf()
                    : null,
            memo: this.transactionMemo != null ? this.transactionMemo : null,

            transactionFee:
                this.transactionFee != null
                    ? this.transactionFee.toTinybars()
                    : null,

            contractCallResult:
                this.contractFunctionResult != null
                    ? this.contractFunctionResult
                    : null,

            contractCreateResult:
                this.contractFunctionResult != null
                    ? this.contractFunctionResult
                    : null,

            transferList:
                this.transfers != null
                    ? {
                          accountAmounts: this.transfers.map((transfer) =>
                              transfer._toProtobuf()
                          ),
                      }
                    : null,
            tokenTransferLists: this.tokenTransfers._toProtobuf(),
        };
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
            tokenTransfers: TokenTransferMap._fromProtobuf(
                record.tokenTransferLists != null
                    ? record.tokenTransferLists
                    : []
            ),
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionRecord}
     */
    static fromBytes(bytes) {
        return TransactionRecord._fromProtobuf(
            proto.TransactionRecord.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TransactionRecord.encode(this._toProtobuf()).finish();
    }
}
