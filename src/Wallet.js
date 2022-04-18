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

import Signer from "./Signer.js";

/**
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./SignerSignature.js").default} SignerSignature
 * @typedef {import("./Provider.js").default} Provider
 * @typedef {import("./Key.js").default} Key
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./account/AccountBalance.js").default} AccountBalance
 * @typedef {import("./account/AccountInfo.js").default} AccountInfo
 */

/**
 * @template {any} O
 * @typedef {import("./query/Query.js").default<O>} Query<O>
 */

/**
 * @abstract
 */
export default class Wallet extends Signer {
    /**
     * @protected
     */
    constructor() {
        super();
    }

    /**
     * @abstract
     * @returns {Provider}
     */
    getProvider() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {Key}
     */
    getAccountKey() {
        throw new Error("not implemented");
    }
}
