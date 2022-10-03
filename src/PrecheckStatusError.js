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

import StatusError from "./StatusError.js";

/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./contract/ContractFunctionResult.js").default} ContractFunctionResult
 */

/**
 * @typedef {object} PrecheckStatusErrorJSON
 * @property {string} name
 * @property {string} status
 * @property {string} transactionId
 * @property {string} message
 * @property {?ContractFunctionResult} contractFunctionResult
 */

export default class PrecheckStatusError extends StatusError {
    /**
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     * @param {?ContractFunctionResult} props.contractFunctionResult
     */
    constructor(props) {
        super(
            props,
            `transaction ${props.transactionId.toString()} failed precheck with status ${props.status.toString()}`
        );

        /**
         * @type {?ContractFunctionResult}
         * @readonly
         */
        this.contractFunctionResult = props.contractFunctionResult;
    }

    /**
     * @returns {PrecheckStatusErrorJSON}
     */
    toJSON() {
        return {
            name: this.name,
            status: this.status.toString(),
            transactionId: this.transactionId.toString(),
            message: this.message,
            contractFunctionResult: this.contractFunctionResult,
        };
    }
}
