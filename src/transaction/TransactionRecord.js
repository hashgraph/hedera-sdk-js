import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import Timestamp from "../Timestamp.js";
import Hbar from "../Hbar.js";
import Transfer from "../Transfer.js";
import ContractFunctionResult from "../contract/ContractFunctionResult.js";
import TokenTransferMap from "../account/TokenTransferMap.js";
import TokenNftTransferMap from "../account/TokenNftTransferMap.js";
import * as proto from "@hashgraph/proto";
import ScheduleId from "../schedule/ScheduleId.js";
import AssessedCustomFee from "../token/AssessedCustomFee.js";

/**
 * @typedef {import("../token/TokenId.js").default} TokenId
 */

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
     * @param {?ScheduleId} props.scheduleRef
     * @param {AssessedCustomFee[]} props.assessedCustomFees
     * @param {TokenNftTransferMap} props.nftTransfers
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

        this.scheduleRef = props.scheduleRef;

        this.assessedCustomFees = props.assessedCustomFees;

        this.nftTransfers = props.nftTransfers;

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {proto.ITransactionRecord}
     */
    _toProtobuf() {
        const tokenTransfers = this.tokenTransfers._toProtobuf();
        const nftTransfers = this.nftTransfers._toProtobuf();

        const tokenTransferLists = [];

        for (const tokenTransfer of tokenTransfers) {
            for (const nftTransfer of nftTransfers) {
                if (
                    tokenTransfer.token != null &&
                    nftTransfer.token != null &&
                    tokenTransfer.token.shardNum ===
                        nftTransfer.token.shardNum &&
                    tokenTransfer.token.realmNum ===
                        nftTransfer.token.realmNum &&
                    tokenTransfer.token.tokenNum === nftTransfer.token.tokenNum
                ) {
                    tokenTransferLists.push({
                        token: tokenTransfer.token,
                        transfers: tokenTransfer.transfers,
                        nftTransfers: tokenTransfer.nftTransfers,
                    });
                } else {
                    tokenTransferLists.push(tokenTransfer);
                    tokenTransferLists.push(nftTransfer);
                }
            }
        }

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
            tokenTransferLists,
            scheduleRef:
                this.scheduleRef != null
                    ? this.scheduleRef._toProtobuf()
                    : null,
            assessedCustomFees: this.assessedCustomFees.map((fee) =>
                fee._toProtobuf()
            ),
        };
    }

    /**
     * @internal
     * @param {proto.ITransactionRecord} record
     * @param {(string | null)=} ledgerId
     * @returns {TransactionRecord}
     */
    static _fromProtobuf(record, ledgerId) {
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
                /** @type {proto.ITransactionReceipt} */ (record.receipt),
                ledgerId
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
                /** @type {proto.ITransactionID} */ (record.transactionID),
                ledgerId
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
            ).map((aa) => Transfer._fromProtobuf(aa, ledgerId)),
            contractFunctionResult,
            tokenTransfers: TokenTransferMap._fromProtobuf(
                record.tokenTransferLists != null
                    ? record.tokenTransferLists
                    : [],
                ledgerId
            ),
            scheduleRef:
                record.scheduleRef != null
                    ? ScheduleId._fromProtobuf(record.scheduleRef, ledgerId)
                    : null,
            assessedCustomFees:
                record.assessedCustomFees != null
                    ? record.assessedCustomFees.map((fee) =>
                          AssessedCustomFee._fromProtobuf(fee)
                      )
                    : [],
            nftTransfers: TokenNftTransferMap._fromProtobuf(
                record.tokenTransferLists != null
                    ? record.tokenTransferLists
                    : [],
                ledgerId
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
