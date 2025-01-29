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

import StatusError from "./StatusError.js";

/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 */

/**
 * Represents an error that occurs when a transaction receipt indicates a failure
 * on the Hedera network. The `ReceiptStatusError` class extends the base
 * `StatusError` class and provides additional context specific to receipt-related
 * failures, such as the transaction ID, status, and any associated messages.
 *
 * This error is typically thrown when a transaction has been processed, but the
 * receipt indicates that it did not complete successfully. It allows developers to
 * handle such errors effectively in their applications by providing detailed
 * information about the failure.
 */
export default class ReceiptStatusError extends StatusError {
    /**
     * @param {object} props
     * @param {TransactionReceipt} props.transactionReceipt
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     */
    constructor(props) {
        super(
            props,
            `receipt for transaction ${props.transactionId.toString()} contained error status ${props.status.toString()}`,
        );

        /**
         * @type {TransactionReceipt}
         * @readonly
         */
        this.transactionReceipt = props.transactionReceipt;
    }
}
