import Hbar from "../Hbar";
import AccountId from "../account/AccountId";
import FileId from "../file/FileId";
import ContractFunctionParameters from "./ContractFunctionParameters";
import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../Transaction";
import { Key } from "@hashgraph/cryptography";
import { _fromProtoKey, _toProtoKey } from "../util";
import Long from "long";
import BigNumber from "bignumber.js";

export default class ContractCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {FileId | string} [props.bytecodeFileId]
     * @param {Key} [props.adminKey]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.initialBalance]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {number | Long} [props.autoRenewPeriod]
     * @param {Uint8Array} [props.constructorParameters]
     * @param {string} [props.contractMemo]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?FileId}
         */
        this._bytecodeFileId = null;

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        /**
         * @private
         * @type {?Long}
         */
        this._gas = null;

        /**
         * @private
         * @type {?Hbar}
         */
        this._initialBalance = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._proxyAccountId = null;

        /**
         * @private
         * @type {Long}
         */
        this._autoRenewPeriod = DEFAULT_AUTO_RENEW_PERIOD;

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._constructorParameters = null;

        /**
         * @private
         * @type {?string}
         */
        this._contractMemo = null;

        if (props.bytecodeFileId != null) {
            this.setBytecodeFileId(props.bytecodeFileId);
        }

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.gas != null) {
            this.setGas(props.gas);
        }

        if (props.initialBalance != null) {
            this.setInitialBalance(props.initialBalance);
        }

        if (props.proxyAccountId != null) {
            this.setProxyAccountId(props.proxyAccountId);
        }

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }

        if (props.constructorParameters != null) {
            this.setConstructorParameters(props.constructorParameters);
        }

        if (props.contractMemo != null) {
            this.setContractMemo(props.contractMemo);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {ContractCreateTransaction}
     */
    static _fromProtobuf(body) {
        const create = /** @type {proto.IContractCreateTransactionBody} */ (body.contractCreateInstance);

        return new ContractCreateTransaction({
            bytecodeFileId:
                create.fileID != null
                    ? FileId._fromProtobuf(
                          /** @type {proto.IFileID} */ (create.fileID)
                      )
                    : undefined,
            adminKey:
                create.adminKey != null
                    ? _fromProtoKey(create.adminKey)
                    : undefined,
            gas: create.gas != null ? create.gas : undefined,
            initialBalance:
                create.initialBalance != null
                    ? create.initialBalance
                    : undefined,
            proxyAccountId:
                create.proxyAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (create.proxyAccountID)
                      )
                    : undefined,
            autoRenewPeriod:
                create.autoRenewPeriod != null
                    ? create.autoRenewPeriod.seconds != null
                        ? create.autoRenewPeriod.seconds
                        : undefined
                    : undefined,
            constructorParameters:
                create.constructorParameters != null
                    ? create.constructorParameters
                    : undefined,
            contractMemo: create.memo != null ? create.memo : undefined,
        });
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
     * @returns {?Long}
     */
    getGas() {
        return this._gas;
    }

    /**
     * @param {number | Long} gas
     * @returns {this}
     */
    setGas(gas) {
        this._requireNotFrozen();
        this._gas = gas instanceof Long ? gas : Long.fromValue(gas);

        return this;
    }

    /**
     * @returns {?Hbar}
     */
    getInitialBalance() {
        return this._initialBalance;
    }

    /**
     * Set the initial amount to transfer into this contract.
     *
     * @param {number | string | Long | BigNumber | Hbar} initialBalance
     * @returns {this}
     */
    setInitialBalance(initialBalance) {
        this._requireNotFrozen();
        this._initialBalance =
            initialBalance instanceof Hbar
                ? initialBalance
                : new Hbar(initialBalance);

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
     * @returns {Long}
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
     * @returns {?Uint8Array}
     */
    getConstructorParameters() {
        return this._constructorParameters;
    }

    /**
     * @param {Uint8Array | ContractFunctionParameters} constructorParameters
     * @returns {this}
     */
    setConstructorParameters(constructorParameters) {
        this._requireNotFrozen();
        this._constructorParameters =
            constructorParameters instanceof Uint8Array
                ? constructorParameters
                : constructorParameters._build();

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
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) =>
            channel.smartContract.createContract(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "contractCreateInstance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IContractCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            fileID:
                this._bytecodeFileId != null
                    ? this._bytecodeFileId._toProtobuf()
                    : null,
            adminKey:
                this._adminKey != null ? _toProtoKey(this._adminKey) : null,
            gas: this._gas,
            initialBalance:
                this._initialBalance != null
                    ? this._initialBalance.toTinybars()
                    : null,
            proxyAccountID:
                this._proxyAccountId != null
                    ? this._proxyAccountId._toProtobuf()
                    : null,
            autoRenewPeriod: {
                seconds: this._autoRenewPeriod,
            },
            constructorParameters: this._constructorParameters,
            memo: this._contractMemo,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "contractCreateInstance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractCreateTransaction._fromProtobuf
);
