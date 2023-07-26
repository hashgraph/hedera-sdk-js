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

import * as grpc from "@grpc/grpc-js";
import MirrorChannel from "./MirrorChannel.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("./MirrorChannel.js").MirrorError} MirrorError
 */

/**
 * @internal
 */
export default class NodeMirrorChannel extends MirrorChannel {
    /**
     * @internal
     * @param {string} address
     */
    constructor(address) {
        super();

        /**
         * @type {grpc.Client}
         * @private
         */
        this._client = new grpc.Client(
            address,
            address.endsWith(":50212") || address.endsWith(":443")
                ? grpc.credentials.createSsl()
                : grpc.credentials.createInsecure()
        );
    }

    /**
     * @override
     * @returns {void}
     */
    close() {
        this._client.close();
    }

    /**
     * @override
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
        serviceName,
        methodName,
        requestData,
        callback,
        error,
        end
    ) {
        const stream = this._client
            .makeServerStreamRequest(
                `/com.hedera.mirror.api.proto.${serviceName}/${methodName}`,
                (value) => value,
                (value) => value,
                Buffer.from(requestData)
            )
            .on("data", (/** @type {Uint8Array} */ data) => {
                callback(data);
            })
            .on("status", (/** @type {grpc.StatusObject} */ status) => {
                if (status.code == 0) {
                    end();
                } else {
                    error(status);
                }
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .on("error", (/** @type {grpc.StatusObject} */ _) => {
                // Do nothing
            });

        return () => {
            stream.cancel();
        };
    }
}
