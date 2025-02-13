/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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
 * @typedef {import("./Hbar.js").default} Hbar
 */

/**
 * Error thrown when a query's cost exceeds the maximum payment amount set on the client.
 *
 * This error is used to prevent unexpectedly expensive queries from being automatically executed.
 * When this error occurs, the user can either:
 * 1. Increase the maximum query payment on the client
 * 2. Explicitly approve the higher cost for this specific query
 */
export default class MaxQueryPaymentExceeded extends Error {
    /**
     * @param {Hbar} queryCost
     * @param {Hbar} maxQueryPayment
     */
    constructor(queryCost, maxQueryPayment) {
        super();

        this.message = `query cost of ${queryCost.toString()} HBAR exceeds max set on client: ${maxQueryPayment.toString()} HBAR`;
        this.name = "MaxQueryPaymentExceededError";
        this.queryCost = queryCost;
        this.maxQueryPayment = maxQueryPayment;
    }
}
