import TransactionReceipt from "./TransactionReceipt.js";
import TransactionId from "./TransactionId.js";
import Timestamp from "../Timestamp.js";
import Hbar from "../Hbar.js";
import Transfer from "../Transfer.js";
import ContractFunctionResult from "../contract/ContractFunctionResult.js";
import TokenTransferMap from "../account/TokenTransferMap.js";
import TokenNftTransferMap from "../account/TokenNftTransferMap.js";
import * as HashgraphProto from "@hashgraph/proto";
import ScheduleId from "../schedule/ScheduleId.js";
import AssessedCustomFee from "../token/AssessedCustomFee.js";
import TokenAssocation from "../token/TokenAssociation.js";
import Key from "../Key.js";
import PublicKey from "../PublicKey.js";
import TokenTransfer from "../token/TokenTransfer.js";
import HbarAllowance from "../account/HbarAllowance.js";
import TokenAllowance from "../account/TokenAllowance.js";

/**
 * @typedef {import("../token/TokenId.js").default} TokenId
 * @typedef {import("../account/TokenNftAllowance.js").default} TokenNftAllowance
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
     * @param {Timestamp} props.consensusTimestamp
     * @param {TransactionId} props.transactionId
     * @param {string} props.transactionMemo
     * @param {Hbar} props.transactionFee
     * @param {Transfer[]} props.transfers
     * @param {TokenTransferMap} props.tokenTransfers
     * @param {TokenTransfer[]} props.tokenTransfersList
     * @param {?ScheduleId} props.scheduleRef
     * @param {AssessedCustomFee[]} props.assessedCustomFees
     * @param {TokenNftTransferMap} props.nftTransfers
     * @param {TokenAssocation[]} props.automaticTokenAssociations
     * @param {Timestamp | null} props.parentConsensusTimestamp
     * @param {PublicKey | null} props.aliasKey
     * @param {TransactionRecord[]} props.duplicates
     * @param {TransactionRecord[]} props.children
     * @param {HbarAllowance[]} props.hbarAllowanceAdjustments
     * @param {TokenAllowance[]} props.tokenAllowanceAdjustments
     * @param {TokenNftAllowance[]} props.nftAllowanceAdjustments
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
        this.consensusTimestamp = props.consensusTimestamp;

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

        /**
         * All the token transfers from this account
         *
         * @readonly
         */
        this.tokenTransfersList = props.tokenTransfersList;

        /**
         * Reference to the scheduled transaction ID that this transaction record represent
         *
         * @readonly
         */
        this.scheduleRef = props.scheduleRef;

        /**
         * All custom fees that were assessed during a CryptoTransfer, and must be paid if the
         * transaction status resolved to SUCCESS
         *
         * @readonly
         */
        this.assessedCustomFees = props.assessedCustomFees;

        /** @readonly */
        this.nftTransfers = props.nftTransfers;

        /**
         * All token associations implicitly created while handling this transaction
         *
         * @readonly
         */
        this.automaticTokenAssociations = props.automaticTokenAssociations;

        /**
         * The parent consensus timestamp
         *
         * @readonly
         */
        this.parentConsensusTimestamp = props.parentConsensusTimestamp;

        this.aliasKey = props.aliasKey;

        /**
         * @readonly
         */
        this.duplicates = props.duplicates;

        /**
         * @readonly
         */
        this.children = props.children;

        /**
         * @readonly
         */
        this.hbarAllowanceAdjustments = props.hbarAllowanceAdjustments;

        /**
         * @readonly
         */
        this.tokenAllowanceAdjustments = props.tokenAllowanceAdjustments;

        /**
         * @readonly
         */
        this.nftAllowanceAdjustments = props.nftAllowanceAdjustments;

        Object.freeze(this);
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ITransactionGetRecordResponse}
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

        const duplicates = this.duplicates.map(
            (record) =>
                /** @type {HashgraphProto.proto.ITransactionRecord} */ (
                    record._toProtobuf().transactionRecord
                )
        );
        const children = this.children.map(
            (record) =>
                /** @type {HashgraphProto.proto.ITransactionRecord} */ (
                    record._toProtobuf().transactionRecord
                )
        );

        return {
            duplicateTransactionRecords: duplicates,
            childTransactionRecords: children,
            transactionRecord: {
                receipt: this.receipt._toProtobuf().receipt,

                transactionHash:
                    this.transactionHash != null ? this.transactionHash : null,
                consensusTimestamp:
                    this.consensusTimestamp != null
                        ? this.consensusTimestamp._toProtobuf()
                        : null,
                transactionID:
                    this.transactionId != null
                        ? this.transactionId._toProtobuf()
                        : null,
                memo:
                    this.transactionMemo != null ? this.transactionMemo : null,

                transactionFee:
                    this.transactionFee != null
                        ? this.transactionFee.toTinybars()
                        : null,

                // TODO: Implement `ContractFunctionResult._toProtobuf()`
                //                 contractCallResult:
                //                     this.contractFunctionResult != null
                //                         ? this.contractFunctionResult
                //                         : null,
                //
                //                 contractCreateResult:
                //                     this.contractFunctionResult != null
                //                         ? this.contractFunctionResult
                //                         : null,

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
                automaticTokenAssociations: this.automaticTokenAssociations.map(
                    (association) => association._toProtobuf()
                ),
                parentConsensusTimestamp:
                    this.parentConsensusTimestamp != null
                        ? this.parentConsensusTimestamp._toProtobuf()
                        : null,
                alias:
                    this.aliasKey != null
                        ? HashgraphProto.proto.Key.encode(
                              this.aliasKey._toProtobufKey()
                          ).finish()
                        : null,
                cryptoAdjustments: this.hbarAllowanceAdjustments.map(
                    (allowance) => {
                        return allowance._toProtobuf();
                    }
                ),

                tokenAdjustments: this.tokenAllowanceAdjustments.map(
                    (allowance) => {
                        return allowance._toProtobuf();
                    }
                ),
            },
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransactionGetRecordResponse} response
     * @returns {TransactionRecord}
     */
    static _fromProtobuf(response) {
        const record = /** @type {HashgraphProto.proto.ITransactionRecord} */ (
            response.transactionRecord
        );

        let aliasKey =
            record.alias != null && record.alias.length > 0
                ? Key._fromProtobufKey(
                      HashgraphProto.proto.Key.decode(record.alias)
                  )
                : null;

        if (!(aliasKey instanceof PublicKey)) {
            aliasKey = null;
        }

        const children =
            response.childTransactionRecords != null
                ? response.childTransactionRecords.map((child) =>
                      TransactionRecord._fromProtobuf({
                          transactionRecord: child,
                      })
                  )
                : [];

        const duplicates =
            response.duplicateTransactionRecords != null
                ? response.duplicateTransactionRecords.map((duplicate) =>
                      TransactionRecord._fromProtobuf({
                          transactionRecord: duplicate,
                      })
                  )
                : [];

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
            receipt: TransactionReceipt._fromProtobuf({
                receipt:
                    /** @type {HashgraphProto.proto.ITransactionReceipt} */ (
                        record.receipt
                    ),
            }),
            transactionHash:
                record.transactionHash != null
                    ? record.transactionHash
                    : new Uint8Array(),
            consensusTimestamp: Timestamp._fromProtobuf(
                /** @type {HashgraphProto.proto.ITimestamp} */
                (record.consensusTimestamp)
            ),
            transactionId: TransactionId._fromProtobuf(
                /** @type {HashgraphProto.proto.ITransactionID} */ (
                    record.transactionID
                )
            ),
            transactionMemo: record.memo != null ? record.memo : "",
            transactionFee: Hbar.fromTinybars(
                record.transactionFee != null ? record.transactionFee : 0
            ),
            transfers: Transfer._fromProtobuf(
                record.transferList != null
                    ? record.transferList.accountAmounts != null
                        ? record.transferList.accountAmounts
                        : []
                    : []
            ),
            contractFunctionResult,
            tokenTransfers: TokenTransferMap._fromProtobuf(
                record.tokenTransferLists != null
                    ? record.tokenTransferLists
                    : []
            ),
            tokenTransfersList: TokenTransfer._fromProtobuf(
                record.tokenTransferLists != null
                    ? record.tokenTransferLists
                    : []
            ),
            scheduleRef:
                record.scheduleRef != null
                    ? ScheduleId._fromProtobuf(record.scheduleRef)
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
                    : []
            ),
            automaticTokenAssociations:
                record.automaticTokenAssociations != null
                    ? record.automaticTokenAssociations.map((association) =>
                          TokenAssocation._fromProtobuf(association)
                      )
                    : [],
            parentConsensusTimestamp:
                record.parentConsensusTimestamp != null
                    ? Timestamp._fromProtobuf(record.parentConsensusTimestamp)
                    : null,
            aliasKey,
            duplicates,
            children,
            hbarAllowanceAdjustments: (record.cryptoAdjustments != null
                ? record.cryptoAdjustments
                : []
            ).map((allowance) => {
                return HbarAllowance._fromProtobuf(allowance);
            }),
            tokenAllowanceAdjustments: (record.tokenAdjustments != null
                ? record.tokenAdjustments
                : []
            ).map((allowance) => {
                return TokenAllowance._fromProtobuf(allowance);
            }),
            nftAllowanceAdjustments: [],
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TransactionRecord}
     */
    static fromBytes(bytes) {
        return TransactionRecord._fromProtobuf(
            HashgraphProto.proto.TransactionGetRecordResponse.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.TransactionGetRecordResponse.encode(
            this._toProtobuf()
        ).finish();
    }
}
