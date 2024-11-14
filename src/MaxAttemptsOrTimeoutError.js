/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2024 Hedera Hashgraph, LLC
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
 * @typedef {object} MaxAttemptsOrTimeoutErrorJSON
 * @property {string} message
 * @property {string} nodeAccountId
 *
 */

export default class MaxAttemptsOrTimeoutError extends Error {
    /**
     * @param {string} message
     * @param {string} nodeAccountId
     */
    constructor(message, nodeAccountId) {
        // Call the Error constructor with the message
        super(message);

        // Assign the nodeAccountId as a custom property
        this.nodeAccountId = nodeAccountId;
    }

    toJSON() {
        return {
            message: this.message,
            nodeAccountId: this.nodeAccountId,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {MaxAttemptsOrTimeoutErrorJSON}
     */
    valueOf() {
        return this.toJSON();
    }
}
