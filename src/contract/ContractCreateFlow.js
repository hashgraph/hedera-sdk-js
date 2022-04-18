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

import FileCreateTransaction from "../file/FileCreateTransaction.js";
import FileAppendTransaction from "../file/FileAppendTransaction.js";
import FileDeleteTransaction from "../file/FileDeleteTransaction.js";
import ContractCreateTransaction from "./ContractCreateTransaction.js";
import * as utf8 from "../encoding/utf8.js";

/**
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../file/FileId.js").default} FileId
 * @typedef {import("../Key.js").default} Key
 * @typedef {import("./ContractFunctionParameters.js").default} ContractFunctionParameters
 * @typedef {import("../Hbar.js").default} Hbar
 * @typedef {import("../Duration.js").default} Duration
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("../client/Client.js").ClientOperator} ClientOperator
 */

/**
 * @typedef {import("bignumber.js").BigNumber} BigNumber
 * @typedef {import("long").Long} Long
 */

export default class ContractCreateFlow {
    constructor() {
        /** @type {Uint8Array | null} */
        this._bytecode = null;
        this._contractCreate = new ContractCreateTransaction();
    }

    /**
     * @returns {?Uint8Array}
     */
    get bytecode() {
        return this._bytecode;
    }

    /**
     * @param {string | Uint8Array} bytecode
     * @returns {this}
     */
    setBytecode(bytecode) {
        this._bytecode =
            bytecode instanceof Uint8Array ? bytecode : utf8.encode(bytecode);

        return this;
    }

    /**
     * @returns {?Key}
     */
    get adminKey() {
        return this._contractCreate.adminKey;
    }

    /**
     * @param {Key} adminKey
     * @returns {this}
     */
    setAdminKey(adminKey) {
        this._contractCreate.setAdminKey(adminKey);
        return this;
    }

    /**
     * @returns {?Long}
     */
    get gas() {
        return this._contractCreate.gas;
    }

    /**
     * @param {number | Long} gas
     * @returns {this}
     */
    setGas(gas) {
        this._contractCreate.setGas(gas);
        return this;
    }

    /**
     * @returns {?Hbar}
     */
    get initialBalance() {
        return this._contractCreate.initialBalance;
    }

    /**
     * Set the initial amount to transfer into this contract.
     *
     * @param {number | string | Long | BigNumber | Hbar} initialBalance
     * @returns {this}
     */
    setInitialBalance(initialBalance) {
        this._contractCreate.setInitialBalance(initialBalance);
        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get proxyAccountId() {
        return this._contractCreate.proxyAccountId;
    }

    /**
     * @param {AccountId | string} proxyAccountId
     * @returns {this}
     */
    setProxyAccountId(proxyAccountId) {
        this._contractCreate.setProxyAccountId(proxyAccountId);
        return this;
    }

    /**
     * @returns {Duration}
     */
    get autoRenewPeriod() {
        return this._contractCreate.autoRenewPeriod;
    }

    /**
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._contractCreate.setAutoRenewPeriod(autoRenewPeriod);
        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get constructorParameters() {
        return this._contractCreate.constructorParameters;
    }

    /**
     * @param {Uint8Array | ContractFunctionParameters} constructorParameters
     * @returns {this}
     */
    setConstructorParameters(constructorParameters) {
        this._contractCreate.setConstructorParameters(constructorParameters);
        return this;
    }

    /**
     * @returns {?string}
     */
    get contractMemo() {
        return this._contractCreate.contractMemo;
    }

    /**
     * @param {string} contractMemo
     * @returns {this}
     */
    setContractMemo(contractMemo) {
        this._contractCreate.setContractMemo(contractMemo);
        return this;
    }

    /**
     * @template {Channel} ChannelT
     * @template MirrorChannelT
     * @param {import("../client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @param {number=} requestTimeout
     * @returns {Promise<TransactionResponse>}
     */
    async execute(client, requestTimeout) {
        if (this._bytecode == null) {
            throw new Error("cannot create contract with no bytecode");
        }

        const key = client.operatorPublicKey;

        const fileId = /** @type {FileId} */ (
            (
                await (
                    await new FileCreateTransaction()
                        .setKeys(key != null ? [key] : [])
                        .setContents(
                            this._bytecode.subarray(
                                0,
                                Math.min(this._bytecode.length, 2048)
                            )
                        )
                        .execute(client, requestTimeout)
                ).getReceipt(client)
            ).fileId
        );

        if (this._bytecode.length > 2048) {
            await (
                await new FileAppendTransaction()
                    .setFileId(fileId)
                    .setContents(this._bytecode.subarray(2048))
                    .execute(client, requestTimeout)
            ).getReceipt(client);
        }

        const response = await this._contractCreate
            .setBytecodeFileId(fileId)
            .execute(client);
        await response.getReceipt(client);

        if (key != null) {
            await (
                await new FileDeleteTransaction()
                    .setFileId(fileId)
                    .execute(client, requestTimeout)
            ).getReceipt(client);
        }

        return response;
    }
}
