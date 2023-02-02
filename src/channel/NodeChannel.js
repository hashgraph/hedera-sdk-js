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

import { Client, credentials } from "@grpc/grpc-js";
import Channel from "./Channel.js";
import GrpcServicesError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";

/**
 * @property {?HashgraphProto.proto.CryptoService} _crypto
 * @property {?HashgraphProto.proto.SmartContractService} _smartContract
 * @property {?HashgraphProto.proto.FileService} _file
 * @property {?HashgraphProto.proto.FreezeService} _freeze
 * @property {?HashgraphProto.proto.ConsensusService} _consensus
 * @property {?HashgraphProto.proto.NetworkService} _network
 */
export default class NodeChannel extends Channel {
    /**
     * @internal
     * @param {string} address
     * @param {string=} cert
     * @param {number=} maxExecutionTime
     */
    constructor(address, cert, maxExecutionTime) {
        super();

        this.cert = cert;
        this.maxExecutionTime = maxExecutionTime;

        let security;
        let options;

        if (this.cert != null) {
            security = credentials.createSsl(Buffer.from(this.cert));
            options = {
                "grpc.ssl_target_name_override": "127.0.0.1",
                "grpc.default_authority": "127.0.0.1",
                "grpc.http_connect_creds": "0",
                // https://github.com/grpc/grpc-node/issues/1593
                // https://github.com/grpc/grpc-node/issues/1545
                // https://github.com/grpc/grpc/issues/13163
                "grpc.keepalive_timeout_ms": 1,
                "grpc.keepalive_permit_without_calls": 1,
            };
        } else {
            security = credentials.createInsecure();
        }

        /**
         * @type {Client}
         * @private
         */
        this._client = new Client(address, security, options);
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
     * @protected
     * @param {string} serviceName
     * @returns {import("protobufjs").RPCImpl}
     */
    _createUnaryClient(serviceName) {
        return (method, requestData, callback) => {
            if (this._client.getChannel().getConnectivityState(false) == 4) {
                callback(new GrpcServicesError(GrpcStatus.Unavailable));
                return;
            }

            let received = false;

            setTimeout(() => {
                if (!received) {
                    this._client.close();
                    callback(new GrpcServicesError(GrpcStatus.Timeout));
                }
            }, this.maxExecutionTime);

            this._client.makeUnaryRequest(
                `/proto.${serviceName}/${method.name}`,
                (value) => value,
                (value) => {
                    received = true;
                    return value;
                },
                Buffer.from(requestData),
                (e, r) => {
                    callback(e, r);
                }
            );
        };
    }
}
