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

import GrpcStatus from "./GrpcStatus.js";

/**
 * Describes how the gRPC request failed.
 *
 * Exists in order for the Hedera JavaScript SDK to produce the same error type for gRPC errors regardless of
 * operating in node or the browser.
 *
 * Definition taken from <https://grpc.github.io/grpc/node/grpc.html#~ServiceError>.
 */
export default class GrpcServiceError extends Error {
    /**
     * @param {GrpcStatus} status
     */
    constructor(status) {
        super(`gRPC service failed with status: ${status.toString()}`);

        /**
         * @readonly
         */
        this.status = status;

        this.name = "GrpcServiceError";

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, GrpcServiceError);
        }
    }

    /**
     * @param {Error & { code?: number; details?: string }} obj
     * @returns {Error}
     */
    static _fromResponse(obj) {
        if (obj.code != null && obj.details != null) {
            const status = GrpcStatus._fromValue(obj.code);
            const err = new GrpcServiceError(status);
            err.message = obj.details;
            return err;
        } else {
            return /** @type {Error} */ (obj);
        }
    }
}
