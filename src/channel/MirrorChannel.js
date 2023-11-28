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
 * @typedef {object} MirrorError
 * @property {number} code
 * @property {string} details
 */

/**
 * @internal
 * @abstract
 */
export default class MirrorChannel {
    /**
     * @abstract
     * @returns {void}
     */
    close() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @param {string} serviceName
     * @param {string} methodName
     * @param {Uint8Array} requestData
     * @param {(data: Uint8Array) => void} callback
     * @param {(error: MirrorError | Error) => void} error
     * @param {() => void} end
     * @returns {() => void}
     */
    makeServerStreamRequest(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        serviceName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        methodName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        requestData,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        callback,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        end,
    ) {
        throw new Error("not implemented");
    }
}
