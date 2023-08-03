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
import GrpcServicesError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";

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

        const cert = address.endsWith(":50212") || address.endsWith(":443");
        let security;
        let options;

        if (cert) {
            security = grpc.credentials.createSsl();
            options = {
                "grpc.ssl_target_name_override": "127.0.0.1",
                "grpc.default_authority": "127.0.0.1",
                "grpc.http_connect_creds": "0",
                // https://github.com/grpc/grpc-node/issues/1593
                // https://github.com/grpc/grpc-node/issues/1545
                // https://github.com/grpc/grpc/issues/13163
                "grpc.keepalive_timeout_ms": 10000,
                "grpc.keepalive_permit_without_calls": 1,
                "grpc.enable_retries": 0,
            }
        } else {
            security = grpc.credentials.createInsecure();
            options = {
                "grpc.keepalive_timeout_ms": 10000,
                "grpc.keepalive_permit_without_calls": 1,
                "grpc.enable_retries": 0,
            }
        }

        /**
         * @type {grpc.Client}
         * @private
         */
        this._client = new grpc.Client(address, security, options);
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
        //this._client.waitForReady(100000, (err) => {
            /* if (err) {
                error(new GrpcServicesError(GrpcStatus.Timeout));
            } else { */
                this._client.makeUnaryRequest(
                    `/com.hedera.mirror.api.proto.${serviceName}/${methodName}`,
                    (value) => value,
                    (value) => value,
                    Buffer.from(requestData),
                    (e, r) => {
                        console.log(e)
                        /* if (e != null) {
                            error(new GrpcServicesError(GrpcStatus._fromValue(e.code)));
                        } else if (r != undefined) { */
                        if (r != undefined) {
                            callback(r);
                        }
                    }
                )
                .on("status", (/** @type {grpc.StatusObject} */ status) => {
                    console.log(status)
                    if (status.code == 0) {
                        end();
                    } else {
                        error(status);
                    }
                });
            //}
        //});
        
        return () => {
            //this.close();
        };
    }
}
