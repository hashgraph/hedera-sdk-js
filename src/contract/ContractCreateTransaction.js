import Hbar from "../Hbar.js";
import AccountId from "../account/AccountId.js";
import FileId from "../file/FileId.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";
import Duration from "../Duration.js";
import Key from "../Key.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractCreateTransactionBody} HashgraphProto.proto.IContractCreateTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 * @typedef {import("@hashgraph/proto").proto.IFileID} HashgraphProto.proto.IFileID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

export default class ContractCreateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {FileId | string} [props.bytecodeFileId]
     * @param {Key} [props.adminKey]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.initialBalance]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
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
         * @type {Duration}
         */
        this._autoRenewPeriod = new Duration(DEFAULT_AUTO_RENEW_PERIOD);

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

        this._defaultMaxTransactionFee = new Hbar(20);

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
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {ContractCreateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const create =
            /** @type {HashgraphProto.proto.IContractCreateTransactionBody} */ (
                body.contractCreateInstance
            );

        return Transaction._fromProtobufTransactions(
            new ContractCreateTransaction({
                bytecodeFileId:
                    create.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IFileID} */ (
                                  create.fileID
                              )
                          )
                        : undefined,
                adminKey:
                    create.adminKey != null
                        ? Key._fromProtobufKey(create.adminKey)
                        : undefined,
                gas: create.gas != null ? create.gas : undefined,
                initialBalance:
                    create.initialBalance != null
                        ? create.initialBalance
                        : undefined,
                proxyAccountId:
                    create.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IAccountID} */ (
                                  create.proxyAccountID
                              )
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
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?FileId}
     */
    get bytecodeFileId() {
        return this._bytecodeFileId;
    }

    /**
     * @param {FileId | string} bytecodeFileId
     * @returns {this}
     */
    setBytecodeFileId(bytecodeFileId) {
        this._requireNotFrozen();
        this._bytecodeFileId =
            typeof bytecodeFileId === "string"
                ? FileId.fromString(bytecodeFileId)
                : bytecodeFileId.clone();

        return this;
    }

    /**
     * @returns {?Key}
     */
    get adminKey() {
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
    get gas() {
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
    get initialBalance() {
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
    get proxyAccountId() {
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
     * @returns {Duration}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Duration
                ? autoRenewPeriod
                : new Duration(autoRenewPeriod);

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get constructorParameters() {
        return this._constructorParameters;
    }

    /**
     * @param {Uint8Array | ContractFunctionParameters} constructorParameters
     * @returns {this}
     */
    setConstructorParameters(constructorParameters) {
        this._requireNotFrozen();
        this._constructorParameters =
            constructorParameters instanceof ContractFunctionParameters
                ? constructorParameters._build()
                : constructorParameters;

        return this;
    }

    /**
     * @returns {?string}
     */
    get contractMemo() {
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
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._bytecodeFileId != null) {
            this._bytecodeFileId.validateChecksum(client);
        }

        if (this._proxyAccountId != null) {
            this._proxyAccountId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.createContract(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "contractCreateInstance";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IContractCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            fileID:
                this._bytecodeFileId != null
                    ? this._bytecodeFileId._toProtobuf()
                    : null,
            adminKey:
                this._adminKey != null ? this._adminKey._toProtobufKey() : null,
            gas: this._gas,
            initialBalance:
                this._initialBalance != null
                    ? this._initialBalance.toTinybars()
                    : null,
            proxyAccountID:
                this._proxyAccountId != null
                    ? this._proxyAccountId._toProtobuf()
                    : null,
            autoRenewPeriod: this._autoRenewPeriod._toProtobuf(),
            constructorParameters: this._constructorParameters,
            memo: this._contractMemo,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `ContractCreateTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "contractCreateInstance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractCreateTransaction._fromProtobuf
);
