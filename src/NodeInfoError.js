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
 * @typedef {import("./account/AccountId.js").default} AccountId
 */

/**
 * @typedef {object} NodeInfoErrorJSON
 * @property {string} message
 * @property {string} nodeAccountId
 *
 */

export default class NodeInfoError extends Error {
    /**
     * @param {string} message
     * @param {AccountId} nodeAccountId
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
            nodeAccountId: this.nodeAccountId.toString(),
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {NodeInfoErrorJSON}
     */
    valueOf() {
        return this.toJSON();
    }
}
