import AccountId from "../account/AccountId";
import ContractId from "./ContractId";
import FileId from "../file/FileId";
import Timestamp from "../Timestamp";
import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../transaction/Transaction";
import { Key } from "@hashgraph/cryptography";
import { keyToProtobuf, keyFromProtobuf } from "../cryptography/protobuf";
import Long from "long";

export default class ContractUpdateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {ContractId | string} [props.contractId]
     * @param {FileId | string} [props.bytecodeFileId]
     * @param {Timestamp} [props.expirationTime]
     * @param {Key} [props.adminKey]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {number | Long} [props.autoRenewPeriod]
     * @param {string} [props.contractMemo]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;

        /**
         * @private
         * @type {?Timestamp}
         */
        this._expirationTime = null;

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._proxyAccountId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._autoRenewPeriod = null;

        /**
         * @private
         * @type {?FileId}
         */
        this._bytecodeFileId = null;

        /**
         * @private
         * @type {?string}
         */
        this._contractMemo = null;

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        if (props.expirationTime != null) {
            this.setExpirationTime(props.expirationTime);
        }

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.proxyAccountId != null) {
            this.setProxyAccountId(props.proxyAccountId);
        }

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }

        if (props.bytecodeFileId != null) {
            this.setBytecodeFileId(props.bytecodeFileId);
        }

        if (props.contractMemo != null) {
            this.setContractMemo(props.contractMemo);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {ContractUpdateTransaction}
     */
    static _fromProtobuf(body) {
        const update = /** @type {proto.IContractUpdateTransactionBody} */ (body.contractUpdateInstance);

        return new ContractUpdateTransaction({
            contractId:
                update.contractID != null
                    ? ContractId._fromProtobuf(
                          /** @type {proto.ContractID} */ (update.contractID)
                      )
                    : undefined,
            bytecodeFileId:
                update.fileID != null
                    ? FileId._fromProtobuf(
                          /** @type {proto.IFileID} */ (update.fileID)
                      )
                    : undefined,
            expirationTime:
                update.expirationTime != null
                    ? Timestamp._fromProtobuf(update.expirationTime)
                    : undefined,
            adminKey:
                update.adminKey != null
                    ? keyFromProtobuf(update.adminKey)
                    : undefined,
            proxyAccountId:
                update.proxyAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (update.proxyAccountID)
                      )
                    : undefined,
            autoRenewPeriod:
                update.autoRenewPeriod != null
                    ? update.autoRenewPeriod.seconds != null
                        ? update.autoRenewPeriod.seconds
                        : undefined
                    : undefined,
            contractMemo: update.memo != null ? update.memo : undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    getContractId() {
        return this._contractId;
    }

    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractUpdateTransaction}
     */
    setContractId(contractId) {
        this._requireNotFrozen();
        this._contractId =
            contractId instanceof ContractId
                ? contractId
                : ContractId.fromString(contractId);

        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    getExpirationTime() {
        return this._expirationTime;
    }

    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {Timestamp} expirationTime
     * @returns {ContractUpdateTransaction}
     */
    setExpirationTime(expirationTime) {
        this._requireNotFrozen();
        this._expirationTime = expirationTime;

        return this;
    }

    /**
     * @returns {?Key}
     */
    getAdminKey() {
        return this._adminKey;
    }

    /**
     * @param {Key} adminKey
     * @returns {this}
     */
    setAdminKey(adminKey) {
        this._requireNotFrozen();
        this._adminKey = adminKey;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    getProxyAccountId() {
        return this._proxyAccountId;
    }

    /**
     * @param {AccountId | string} proxyAccountId
     * @returns {this}
     */
    setProxyAccountId(proxyAccountId) {
        this._requireNotFrozen();
        this._proxyAccountId =
            proxyAccountId instanceof AccountId
                ? proxyAccountId
                : AccountId.fromString(proxyAccountId);

        return this;
    }

    /**
     * @returns {?Long}
     */
    getAutoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * @param {number | Long} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Long
                ? autoRenewPeriod
                : Long.fromValue(autoRenewPeriod);

        return this;
    }

    /**
     * @returns {?FileId}
     */
    getBytecodeFileId() {
        return this._bytecodeFileId;
    }

    /**
     * @param {FileId | string} bytecodeFileId
     * @returns {this}
     */
    setBytecodeFileId(bytecodeFileId) {
        this._requireNotFrozen();
        this._bytecodeFileId =
            bytecodeFileId instanceof FileId
                ? bytecodeFileId
                : FileId.fromString(bytecodeFileId);

        return this;
    }

    /**
     * @returns {?string}
     */
    getContractMemo() {
        return this._contractMemo;
    }

    /**
     * @param {string} contractMemo
     * @returns {this}
     */
    setContractMemo(contractMemo) {
        this._requireNotFrozen();
        this._contractMemo = contractMemo;

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.ITransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) =>
            channel.smartContract.updateContract(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "contractUpdateInstance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IContractUpdateTransactionBody}
     */
    _makeTransactionData() {
        return {
            contractID:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
            expirationTime:
                this._expirationTime != null
                    ? this._expirationTime._toProtobuf()
                    : null,
            adminKey:
                this._adminKey != null ? keyToProtobuf(this._adminKey) : null,
            proxyAccountID:
                this._proxyAccountId != null
                    ? this._proxyAccountId._toProtobuf()
                    : null,
            autoRenewPeriod:
                this._autoRenewPeriod != null
                    ? {
                          seconds: this._autoRenewPeriod,
                      }
                    : null,
            fileID: this._bytecodeFileId
                ? this._bytecodeFileId._toProtobuf()
                : null,
            memo: this._contractMemo,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "contractUpdateInstance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractUpdateTransaction._fromProtobuf
);
