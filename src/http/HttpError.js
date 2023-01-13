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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import HttpStatus from "./HttpStatus.js";

/**
 * Describes how the http request failed.
 */
export default class HttpError extends Error {
    /**
     * @param {HttpStatus} status
     */
    constructor(status) {
        super(`failed with error code: ${status.toString()}`);

        /**
         * @readonly
         */
        this.status = status;

        this.name = "HttpError";

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
