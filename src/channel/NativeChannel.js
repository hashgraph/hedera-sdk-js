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

import Channel, { encodeRequest, decodeUnaryResponse } from "./Channel.js";
import * as base64 from "../encoding/base64.native.js";
import HttpError from "../http/HttpError.js";
import HttpStatus from "../http/HttpStatus.js";

export default class NativeChannel extends Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        super();

        /**
         * @type {string}
         * @private
         */
        this._address = address;
    }

    /**
     * @override
     * @returns {void}
     */
    close() {
        // do nothing
    }

    /**
     * @override
     * @protected
     * @param {string} serviceName
     * @returns {import("protobufjs").RPCImpl}
     */
    _createUnaryClient(serviceName) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        return async (method, requestData, callback) => {
            try {
                const data = base64.encode(
                    new Uint8Array(encodeRequest(requestData))
                );

                const response = await fetch(
                    `${this._address}/proto.${serviceName}/${method.name}`,
                    {
                        method: "POST",
                        headers: {
                            "content-type": "application/grpc-web-text",
                            "x-user-agent": "hedera-sdk-js/v2",
                            "x-accept-content-transfer-encoding": "base64",
                            "x-grpc-web": "1",
                        },
                        body: data,
                    }
                );

                if (!response.ok) {
                    const error = new HttpError(
                        HttpStatus._fromValue(response.status)
                    );
                    callback(error, null);
                }

                const blob = await response.blob();

                /** @type {string} */
                const responseData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        resolve(/** @type {string} */ (reader.result));
                    };
                    reader.onerror = reject;
                });

                let responseBuffer;
                if (
                    responseData.startsWith(
                        "data:application/octet-stream;base64,"
                    )
                ) {
                    responseBuffer = base64.decode(
                        responseData.split(
                            "data:application/octet-stream;base64,"
                        )[1]
                    );
                } else if (
                    responseData.startsWith(
                        "data:application/grpc-web+proto;base64,"
                    )
                ) {
                    responseBuffer = base64.decode(
                        responseData.split(
                            "data:application/grpc-web+proto;base64,"
                        )[1]
                    );
                } else {
                    throw new Error(
                        `Expected response data to be base64 encode with a 'data:application/octet-stream;base64,' or 'data:application/grpc-web+proto;base64,' prefix, but found: ${responseData}`
                    );
                }

                const unaryResponse = decodeUnaryResponse(
                    responseBuffer.buffer,
                    responseBuffer.byteOffset,
                    responseBuffer.byteLength
                );

                callback(null, unaryResponse);
            } catch (error) {
                callback(/** @type {Error} */ (error), null);
            }
        };
    }
}
