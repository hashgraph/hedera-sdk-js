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
     */
    constructor(address, cert) {
        super();

        this.cert = cert;

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
            options = {
                //After a duration of this time the client/server pings its peer to see if the transport is still alive.
                //"grpc.keepalive_time_ms": 60000,
                //After waiting for a duration of this time, if the keepalive ping sender does not receive the ping back, it will close the transport.
                //"grpc.keepalive_timeout_ms": 10000000,
                //Is it permissible to send keepalive pings from the client without any outstanding streams.
                "grpc.keepalive_permit_without_calls": 1,
                //Maximum time that a channel may have no outstanding rpcs, after which the server will close the connection.
                "grpc.max_connection_idle_ms": 10000000,
                //The time between the first and second connection attempts, in ms.
                "grpc.initial_reconnect_backoff_ms": 10,
                //The minimum time between subsequent connection attempts, in ms.
                "grpc.min_reconnect_backoff_ms": 10,
                //The maximum time between subsequent connection attempts, in ms.
                "grpc.max_reconnect_backoff_ms": 10000000,
                //Maximum time that a channel may exist.
                "grpc.max_connection_age_ms": 10000000 ,
                //Minimum allowed time between a server receiving successive ping frames without sending any data/header frame.
                //"grpc.http2.min_ping_interval_without_data_ms": 100
                "grpc.experimental.enable_hedging": 1,
                //Maximum message length that the channel can send.
                "grpc.max_send_message_length": -1,
                //Maximum message length that the channel can receive.
                "grpc.max_receive_message_length": -1,
                "grpc-node.max_session_memory": Number.MAX_SAFE_INTEGER
            };
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
        console.log(`serviceName ${serviceName}`);
        return (method, requestData, callback) => {
            if (this._client.getChannel().getConnectivityState(false) == 4) {
                callback(new GrpcServicesError(GrpcStatus.Unavailable));
                return;
            }

            let received = false;

            setTimeout(() => {
                if (!received) {
                    //Removed close of the client because taking more than 10s does not mean that the node is unavailable.
                    callback(new GrpcServicesError(GrpcStatus.Timeout));
                }
            }, 10_000);

            //let s = 
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
            )
            //console.log(s.call);
        };
    }
}
