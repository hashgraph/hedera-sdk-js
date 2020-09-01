import TransactionReceipt from "./TransactionReceipt";
import TransactionId from "./TransactionId";
import Time from "./Time";
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
     * @param {(ContractFunctionResult)=} properties.callResult
     * @param {(boolean)=} properties.callResultIsCreate
     * @param {TransactionReceipt} properties.receipt
     * @param {Uint8Array} properties.transactionHash
     * @param {Time} properties.consensusTimestamp
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
         * @type {TransactionReceipt}
         */
        this.receipt = properties.receipt;

        /**
         * The hash of the Transaction that executed (not the hash of any Transaction that failed
         * for having a duplicate TransactionID).
         *
         * @type {Uint8Array}
         */
        this.transactionHash = properties.transactionHash;

        /**
         * The consensus timestamp (or null if didn't reach consensus yet).
         *
         * @type {Time}
         */
        this.consensusTimestamp = properties.consensusTimestamp;

        /**
         * The ID of the transaction this record represents.
         *
         * @type {TransactionId}
         */
        this.transactionId = properties.transactionId;

        /**
         * The memo that was submitted as part of the transaction (max 100 bytes).
         *
         * @type {string}
         */
        this.transactionMemo = properties.transactionMemo;

        /**
         * The actual transaction fee charged,
         * not the original transactionFee value from TransactionBody.
         *
         * @type {Hbar}
         */
        this.transactionFee = properties.transactionFee;

        /**
         * All hbar transfers as a result of this transaction, such as fees, or transfers performed
         * by the transaction, or by a smart contract it calls, or by the creation of threshold
         * records that it triggers.
         *
         * @type {Transfer[]}
         */
        this.transfers = properties.transfers;

        /**
         * @private
         *
         * @type {ContractFunctionResult | null}
         */
        this._callResult = properties.callResult ?? null;

        /**
         * @private
         *
         * @type {boolean}
         */
        this._callResultIsCreate = properties.callResultIsCreate ?? false;

        Object.freeze(this);
    }

    /**
     * @param {proto.ITransactionRecord} record
     * @returns {TransactionRecord}
     */
    static _fromProtobuf(record) {
        let callResultIsCreate = false;
        let callResult;

        if (record.contractCallResult != null) {
            callResult = ContractFunctionResult._fromProtobuf(
                record.contractCallResult
            );
            callResultIsCreate = true;
        } else if (record.contractCreateResult != null) {
            callResult = ContractFunctionResult._fromProtobuf(
                record.contractCreateResult
            );
        }

        return new TransactionRecord({
            // @ts-ignore
            receipt: TransactionReceipt._fromProtobuf(record.receipt),
            // @ts-ignore
            transactionHash: record.transactionHash,
            // @ts-ignore
            consensusTimestamp: Time._fromProtobuf(record.consensusTimestamp),
            // @ts-ignore
            transactionId: TransactionId._fromProtobuf(record.transactionID),
            // @ts-ignore
            transactionMemo: record.memo,
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
            transactionFee: Hbar.fromTinybar(record.transactionFee),
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            transfers: record.transferList.accountAmounts.map((aa) =>
                Transfer._fromProtobuf(aa)
            ),
            callResult,
            callResultIsCreate,
        });
    }

    /**
     * @returns {ContractFunctionResult}
     */
    getContractCreateResult() {
        if (this._callResult == null || this._callResultIsCreate) {
            throw new Error("record does not contain a contract create result");
        }

        return this._callResult;
    }

    getContractExecuteResult() {
        if (this._callResult == null || !this._callResultIsCreate) {
            throw new Error(
                "record does not contain a contract execute result"
            );
        }

        return this._callResult;
    }
}
