import Status from "./Status.js";
import TransactionId from "./transaction/TransactionId.js";
import ajv from "./Ajv.js";

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
 * @typedef {object} StatusErrorJSON
 * @property {string} name
 * @property {string} status
 * @property {string} transactionId
 * @property {string} message
 */

const validate = ajv.compile({
    type: "object",
    properties: {
        name: { type: "string", format: "StatusErrorName" },
        status: { type: "string", format: "Status" },
        transactionId: { type: "string", format: "TransactionId" },
        message: { type: "string" },
    },
    required: ["name", "status", "transactionId", "message"],
    additionalProperties: false,
});

export default class StatusError extends Error {
    /**
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     * @param {string} message
     */
    constructor(props, message) {
        super(message);

        this.name = "StatusError";

        this.status = props.status;

        this.transactionId = props.transactionId;

        this.message = message;

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, StatusError);
        }
    }

    /**
     * @param {any} obj
     * @returns {obj is StatusErrorJSON}
     */
    static isStatusErrorJSON(obj) {
        return validate(obj);
    }

    /**
     * @param {StatusErrorJSON} json
     * @returns {StatusError}
     */
    static fromJSON(json) {
        return new StatusError(
            {
                status: Status.fromString(json.status),
                transactionId: TransactionId.fromString(json.transactionId),
            },
            json.message
        );
    }

    /**
     * @returns {StatusErrorJSON}
     */
    toJSON() {
        return {
            name: this.name,
            status: this.status.toString(),
            transactionId: this.transactionId.toString(),
            message: this.message,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {StatusErrorJSON}
     */
    valueOf() {
        return this.toJSON();
    }
}
