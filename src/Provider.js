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

/**
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./transaction/TransactionRecord.js").default} TransactionRecord
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./account/AccountBalance.js").default} AccountBalance
 * @typedef {import("./account/AccountInfo.js").default} AccountInfo
 */

/**
 * @template O
 * @typedef {import("./query/Query.js").default<O>} Query<O>
 */

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @typedef {import("./Executable.js").default<RequestT, ResponseT, OutputT>} Executable<RequestT, ResponseT, OutputT>
 */

/**
 * @abstract
 */
export default class Provider {
    /**
     * @protected
     */
    constructor() {
        // this is intentional
    }

    /**
     * @abstract
     * @returns {LedgerId?}
     */
    getLedgerId() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {string[]}
     */
    getMirrorNetwork() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountBalance>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountBalance(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountInfo>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountInfo(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {AccountId | string} accountId
     * @returns {Promise<TransactionRecord[]>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountRecords(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {TransactionId | string} transactionId
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTransactionReceipt(transactionId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {TransactionResponse} response
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    waitForReceipt(response) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendRequest(request) {
        throw new Error("not implemented");
    }
}
