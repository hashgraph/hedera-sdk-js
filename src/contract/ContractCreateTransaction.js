/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

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
     * @param {Uint8Array} [props.bytecode]
     * @param {Key} [props.adminKey]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.initialBalance]
     * @param {AccountId | string} [props.proxyAccountId]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {Uint8Array} [props.constructorParameters]
     * @param {string} [props.contractMemo]
     * @param {number} [props.maxAutomaticTokenAssociations]
     * @param {AccountId | string} [props.stakedAccountId]
     * @param {Long | number} [props.stakedNodeId]
     * @param {boolean} [props.declineStakingReward]
     * @param {AccountId} [props.autoRenewAccountId]
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
         * @type {?Uint8Array}
         */
        this._bytecode = null;

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

        /**
         * @private
         * @type {?number}
         */
        this._maxAutomaticTokenAssociations = null;

        this._defaultMaxTransactionFee = new Hbar(20);

        /**
         * @private
         * @type {?AccountId}
         */
        this._stakedAccountId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._stakedNodeId = null;

        /**
         * @private
         * @type {boolean}
         */
        this._declineStakingReward = false;

        /**
         * @type {?AccountId}
         */
        this._autoRenewAccountId = null;

        if (props.bytecodeFileId != null) {
            this.setBytecodeFileId(props.bytecodeFileId);
        }

        if (props.bytecode != null) {
            this.setBytecode(props.bytecode);
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
            // eslint-disable-next-line deprecation/deprecation
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

        if (props.maxAutomaticTokenAssociations != null) {
            this.setMaxAutomaticTokenAssociations(
                props.maxAutomaticTokenAssociations
            );
        }

        if (props.stakedAccountId != null) {
            this.setStakedAccountId(props.stakedAccountId);
        }

        if (props.stakedNodeId != null) {
            this.setStakedNodeId(props.stakedNodeId);
        }

        if (props.declineStakingReward != null) {
            this.setDeclineStakingReward(props.declineStakingReward);
        }

        if (props.autoRenewAccountId != null) {
            this.setAutoRenewAccountId(props.autoRenewAccountId);
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
                maxAutomaticTokenAssociations:
                    create.maxAutomaticTokenAssociations != null
                        ? create.maxAutomaticTokenAssociations
                        : undefined,
                stakedAccountId:
                    create.stakedAccountId != null
                        ? AccountId._fromProtobuf(create.stakedAccountId)
                        : undefined,
                stakedNodeId:
                    create.stakedNodeId != null
                        ? create.stakedNodeId
                        : undefined,
                declineStakingReward: create.declineReward == true,
                autoRenewAccountId:
                    create.autoRenewAccountId != null
                        ? AccountId._fromProtobuf(create.autoRenewAccountId)
                        : undefined,
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
        this._bytecode = null;

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get bytecode() {
        return this._bytecode;
    }

    /**
     * @param {Uint8Array} bytecode
     * @returns {this}
     */
    setBytecode(bytecode) {
        this._requireNotFrozen();
        this._bytecode = bytecode;
        this._bytecodeFileId = null;

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
     * @deprecated
     * @returns {?AccountId}
     */
    get proxyAccountId() {
        return this._proxyAccountId;
    }

    /**
     * @deprecated
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
     * An account to charge for auto-renewal of this contract. If not set, or set to an
     * account with zero hbar balance, the contract's own hbar balance will be used to
     * cover auto-renewal fees.
     *
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
     * @returns {?number}
     */
    get maxAutomaticTokenAssociations() {
        return this._maxAutomaticTokenAssociations;
    }

    /**
     * @param {number} maxAutomaticTokenAssociations
     * @returns {this}
     */
    setMaxAutomaticTokenAssociations(maxAutomaticTokenAssociations) {
        this._maxAutomaticTokenAssociations = maxAutomaticTokenAssociations;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get stakedAccountId() {
        return this._stakedAccountId;
    }

    /**
     * @param {AccountId | string} stakedAccountId
     * @returns {this}
     */
    setStakedAccountId(stakedAccountId) {
        this._requireNotFrozen();
        this._stakedAccountId =
            typeof stakedAccountId === "string"
                ? AccountId.fromString(stakedAccountId)
                : stakedAccountId;

        return this;
    }

    /**
     * @returns {?Long}
     */
    get stakedNodeId() {
        return this._stakedNodeId;
    }

    /**
     * @param {Long | number} stakedNodeId
     * @returns {this}
     */
    setStakedNodeId(stakedNodeId) {
        this._requireNotFrozen();
        this._stakedNodeId = Long.fromValue(stakedNodeId);

        return this;
    }

    /**
     * @returns {boolean}
     */
    get declineStakingRewards() {
        return this._declineStakingReward;
    }

    /**
     * @param {boolean} declineStakingReward
     * @returns {this}
     */
    setDeclineStakingReward(declineStakingReward) {
        this._requireNotFrozen();
        this._declineStakingReward = declineStakingReward;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get autoRenewAccountId() {
        return this._autoRenewAccountId;
    }

    /**
     * @param {string | AccountId} autoRenewAccountId
     * @returns {this}
     */
    setAutoRenewAccountId(autoRenewAccountId) {
        this._requireNotFrozen();
        this._autoRenewAccountId =
            typeof autoRenewAccountId === "string"
                ? AccountId.fromString(autoRenewAccountId)
                : autoRenewAccountId;

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
            initcode: this._bytecode,
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
            maxAutomaticTokenAssociations: this._maxAutomaticTokenAssociations,
            stakedAccountId:
                this.stakedAccountId != null
                    ? this.stakedAccountId._toProtobuf()
                    : null,
            stakedNodeId: this.stakedNodeId,
            declineReward: this.declineStakingRewards,
            autoRenewAccountId:
                this._autoRenewAccountId != null
                    ? this._autoRenewAccountId._toProtobuf()
                    : null,
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
