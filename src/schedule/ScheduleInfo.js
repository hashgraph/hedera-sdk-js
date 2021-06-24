import ScheduleId from "./ScheduleId.js";
import AccountId from "../account/AccountId.js";
import {
    keyFromProtobuf,
    keyToProtobuf,
    keyListFromProtobuf,
    keyListToProtobuf,
} from "../cryptography/protobuf.js";
import Timestamp from "../Timestamp.js";
import Transaction from "../transaction/Transaction.js";
import {
    TransactionList as ProtoTransactionList,
    TransactionBody as ProtoTransactionBody,
    SignedTransaction as ProtoSignedTransaction,
    SchedulableTransactionBody as ProtoSchedulableTransactionBody,
} from "@hashgraph/proto";
import TransactionId from "../transaction/TransactionId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IScheduleInfo} proto.IScheduleInfo
 * @typedef {import("@hashgraph/proto").IScheduleID} proto.IScheduleID
 * @typedef {import("@hashgraph/proto").ITimestamp} proto.ITimestamp
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").IScheduleID} proto.IScheduledID
 * @typedef {import("@hashgraph/proto").IFileID} proto.IFileID
 * @typedef {import("@hashgraph/proto").IContractID} proto.IContractID
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 * @typedef {import("@hashgraph/proto").IDuration} proto.IDuration
 * @typedef {import("@hashgraph/proto").ISchedulableTransactionBody} proto.ISchedulableTransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("@hashgraph/cryptography").KeyList} KeyList
 */

/**
 * Response when the client sends the node ScheduleGetInfoQuery.
 */
export default class ScheduleInfo {
    /**
     * @private
     * @param {object} props
     * @param {ScheduleId} props.scheduleId;
     * @param {?AccountId} props.creatorAccountID;
     * @param {?AccountId} props.payerAccountID;
     * @param {?proto.ISchedulableTransactionBody} props.schedulableTransactionBody;
     * @param {?Key} props.adminKey
     * @param {?KeyList} props.signers;
     * @param {?string} props.scheduleMemo;
     * @param {?Timestamp} props.expirationTime;
     * @param {?Timestamp} props.executed;
     * @param {?Timestamp} props.deleted;
     * @param {?TransactionId} props.scheduledTransactionId;
     */
    constructor(props) {
        /**
         *
         * @readonly
         */
        this.scheduleId = props.scheduleId;

        /**
         *
         * @readonly
         */
        this.creatorAccountId = props.creatorAccountID;

        /**
         *
         * @readonly
         */
        this.payerAccountId = props.payerAccountID;

        /**
         *
         * @readonly
         */
        this.schedulableTransactionBody = props.schedulableTransactionBody;

        /**
         *
         * @readonly
         */
        this.signers = props.signers;

        /**
         *
         * @readonly
         */
        this.scheduleMemo = props.scheduleMemo;

        /**
         *
         * @readonly
         */
        this.adminKey = props.adminKey != null ? props.adminKey : null;

        /**
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         *
         * @readonly
         */
        this.executed = props.executed;

        /**
         *
         * @readonly
         */
        this.deleted = props.deleted;

        this.scheduledTransactionId = props.scheduledTransactionId;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IScheduleInfo} info
     * @param {(string | null)=} ledgerId
     * @returns {ScheduleInfo}
     */
    static _fromProtobuf(info, ledgerId) {
        return new ScheduleInfo({
            scheduleId: ScheduleId._fromProtobuf(
                /** @type {proto.IScheduleID} */ (info.scheduleID),
                ledgerId
            ),
            creatorAccountID:
                info.creatorAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (
                              info.creatorAccountID
                          ),
                          ledgerId
                      )
                    : null,
            payerAccountID:
                info.payerAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (info.payerAccountID),
                          ledgerId
                      )
                    : null,
            schedulableTransactionBody:
                info.scheduledTransactionBody != null
                    ? info.scheduledTransactionBody
                    : null,
            adminKey:
                info.adminKey != null
                    ? keyFromProtobuf(info.adminKey, ledgerId)
                    : null,
            signers:
                info.signers != null ? keyListFromProtobuf(info.signers) : null,
            scheduleMemo: info.memo != null ? info.memo : null,
            expirationTime:
                info.expirationTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.expirationTime)
                      )
                    : null,
            executed:
                info.executionTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.executionTime)
                      )
                    : null,
            deleted:
                info.deletionTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.deletionTime)
                      )
                    : null,
            scheduledTransactionId:
                info.scheduledTransactionID != null
                    ? TransactionId._fromProtobuf(
                          info.scheduledTransactionID,
                          ledgerId
                      )
                    : null,
        });
    }

    /**
     * @returns {proto.IScheduleInfo}
     */
    _toProtobuf() {
        return {
            scheduleID:
                this.scheduleId != null ? this.scheduleId._toProtobuf() : null,
            creatorAccountID:
                this.creatorAccountId != null
                    ? this.creatorAccountId._toProtobuf()
                    : null,
            payerAccountID:
                this.payerAccountId != null
                    ? this.payerAccountId._toProtobuf()
                    : null,
            scheduledTransactionBody:
                this.schedulableTransactionBody != null
                    ? this.schedulableTransactionBody
                    : null,
            adminKey:
                this.adminKey != null ? keyToProtobuf(this.adminKey) : null,
            signers:
                this.signers != null ? keyListToProtobuf(this.signers) : null,
            memo: this.scheduleMemo != null ? this.scheduleMemo : "",
            expirationTime:
                this.expirationTime != null
                    ? this.expirationTime._toProtobuf()
                    : null,
            scheduledTransactionID:
                this.scheduledTransactionId != null
                    ? this.scheduledTransactionId._toProtobuf()
                    : null,
        };
    }

    /**
     * @returns {Transaction}
     */
    get scheduledTransaction() {
        if (this.schedulableTransactionBody == null) {
            throw new Error("Scheduled transaction body is empty");
        }

        const scheduled = new ProtoSchedulableTransactionBody(
            this.schedulableTransactionBody
        );
        const data =
            /** @type {NonNullable<ProtoSchedulableTransactionBody["data"]>} */ (
                scheduled.data
            );

        return Transaction.fromBytes(
            ProtoTransactionList.encode({
                transactionList: [
                    {
                        signedTransactionBytes: ProtoSignedTransaction.encode({
                            bodyBytes: ProtoTransactionBody.encode({
                                transactionFee:
                                    this.schedulableTransactionBody
                                        .transactionFee,
                                memo: this.schedulableTransactionBody.memo,
                                [data]: scheduled[data],
                            }).finish(),
                        }).finish(),
                    },
                ],
            }).finish()
        );
    }
}
