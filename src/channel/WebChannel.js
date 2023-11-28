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

import GrpcServiceError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";
import HttpError from "../http/HttpError.js";
import HttpStatus from "../http/HttpStatus.js";
import Channel, { encodeRequest, decodeUnaryResponse } from "./Channel.js";

export default class WebChannel extends Channel {
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
                const response = await fetch(
                    `${this._address}/proto.${serviceName}/${method.name}`,
                    {
                        method: "POST",
                        headers: {
                            "content-type": "application/grpc-web+proto",
                            "x-user-agent": "hedera-sdk-js/v2",
                            "x-grpc-web": "1",
                        },
                        body: encodeRequest(requestData),
                    },
                );

                if (!response.ok) {
                    const error = new HttpError(
                        HttpStatus._fromValue(response.status),
                    );
                    callback(error, null);
                }

                // Check headers for gRPC errors
                const grpcStatus = response.headers.get("grpc-status");
                const grpcMessage = response.headers.get("grpc-message");

                if (grpcStatus != null && grpcMessage != null) {
                    const error = new GrpcServiceError(
                        GrpcStatus._fromValue(parseInt(grpcStatus)),
                    );
                    error.message = grpcMessage;
                    callback(error, null);
                }

                const responseBuffer = await response.arrayBuffer();
                const unaryResponse = decodeUnaryResponse(responseBuffer);

                callback(null, unaryResponse);
            } catch (error) {
                const err = new GrpcServiceError(
                    // retry on grpc web errors
                    GrpcStatus._fromValue(18),
                );
                callback(err, null);
            }
        };
    }
}
