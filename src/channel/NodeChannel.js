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

import { Client, credentials } from "@grpc/grpc-js";
import Channel from "./Channel.js";
import GrpcServicesError from "../grpc/GrpcServiceError.js";
import GrpcStatus from "../grpc/GrpcStatus.js";

// For presentational purposes
const allNetworkIps = [
    //mainnet
    { ip: "34.239.82.6:50211", node: "0.0.3" },
    { ip: "35.237.200.180:50211", node: "0.0.3" },
    { ip: "3.130.52.236:50211", node: "0.0.4" },
    { ip: "35.186.191.247:50211", node: "0.0.4" },
    { ip: "3.18.18.254:50211", node: "0.0.5" },
    { ip: "35.192.2.25:50211", node: "0.0.5" },
    { ip: "74.50.117.35:50211", node: "0.0.5" },
    { ip: "23.111.186.250:50211", node: "0.0.5" },
    { ip: "107.155.64.98:50211", node: "0.0.5" },
    { ip: "13.52.108.243:50211", node: "0.0.6" },
    { ip: "35.199.161.108:50211", node: "0.0.6" },
    { ip: "3.114.54.4:50211", node: "0.0.7" },
    { ip: "35.203.82.240:50211", node: "0.0.7" },
    { ip: "35.236.5.219:50211", node: "0.0.8" },
    { ip: "35.183.66.150:50211", node: "0.0.8" },
    { ip: "35.181.158.250:50211", node: "0.0.9" },
    { ip: "35.197.192.225:50211", node: "0.0.9" },
    { ip: "177.154.62.234:50211", node: "0.0.10" },
    { ip: "3.248.27.48:50211", node: "0.0.10" },
    { ip: "35.242.233.154:50211", node: "0.0.10" },
    { ip: "13.53.119.185:50211", node: "0.0.11" },
    { ip: "35.240.118.96:50211", node: "0.0.11" },
    { ip: "35.204.86.32:50211", node: "0.0.12" },
    { ip: "35.177.162.180:50211", node: "0.0.12" },
    { ip: "34.215.192.104:50211", node: "0.0.13" },
    { ip: "35.234.132.107:50211", node: "0.0.13" },
    { ip: "52.8.21.141:50211", node: "0.0.14" },
    { ip: "35.236.2.27:50211", node: "0.0.14" },
    { ip: "35.228.11.53:50211", node: "0.0.15" },
    { ip: "3.121.238.26:50211", node: "0.0.15" },
    { ip: "34.91.181.183:50211", node: "0.0.16" },
    { ip: "18.157.223.230:50211", node: "0.0.16" },
    { ip: "34.86.212.247:50211", node: "0.0.17" },
    { ip: "18.232.251.19:50211", node: "0.0.17" },
    { ip: "141.94.175.187:50211", node: "0.0.18" },
    { ip: "34.89.87.138:50211", node: "0.0.19" },
    { ip: "18.168.4.59:50211", node: "0.0.19" },
    { ip: "34.82.78.255:50211", node: "0.0.20" },
    { ip: "52.39.162.216:50211", node: "0.0.20" },
    { ip: "34.76.140.109:50211", node: "0.0.21" },
    { ip: "13.36.123.209:50211", node: "0.0.21" },
    { ip: "52.78.202.34:50211", node: "0.0.22" },
    { ip: "34.64.141.166:50211", node: "0.0.22" },
    { ip: "3.18.91.176:50211", node: "0.0.23" },
    { ip: "35.232.244.145:50211", node: "0.0.23" },
    { ip: "69.167.169.208:50211", node: "0.0.23" },
    { ip: "34.89.103.38:50211", node: "0.0.24" },
    { ip: "18.135.7.211:50211", node: "0.0.24" },
    { ip: "34.93.112.7:50211", node: "0.0.25" },
    { ip: "13.232.240.207:50211", node: "0.0.25" },
    { ip: "13.228.103.14:50211", node: "0.0.26" },
    { ip: "34.87.150.174:50211", node: "0.0.26" },
    { ip: "13.56.4.96:50211", node: "0.0.27" },
    { ip: "34.125.200.96:50211", node: "0.0.27" },
    { ip: "35.198.220.75:50211", node: "0.0.28" },
    { ip: "18.139.47.5:50211", node: "0.0.28" },
    { ip: "54.74.60.120:50211", node: "0.0.29" },
    { ip: "34.142.71.129:50211", node: "0.0.29" },
    { ip: "80.85.70.197:50211", node: "0.0.29" },
    { ip: "35.234.249.150:50211", node: "0.0.30" },
    { ip: "34.201.177.212:50211", node: "0.0.30" },
    { ip: "217.76.57.165:50211", node: "0.0.31" },
    { ip: "3.77.94.254:50211", node: "0.0.31" },
    { ip: "34.107.78.179:50211", node: "0.0.31" },
    { ip: "34.86.186.151:50211", node: "0.0.32" },
    { ip: "3.20.81.230:50211", node: "0.0.32" },
    { ip: "18.136.65.22:50211", node: "0.0.33" },
    { ip: "34.142.172.228:50211", node: "0.0.33" },
    { ip: "34.16.139.248:50211", node: "0.0.34" },
    { ip: "35.155.212.90:50211", node: "0.0.34" },
    //testnet
    { ip: "34.94.106.61:50211", node: "0.0.3" },
    { ip: "50.18.132.211:50211", node: "0.0.3" },
    { ip: "3.212.6.13:50211", node: "0.0.4" },
    { ip: "35.237.119.55:50211", node: "0.0.4" },
    { ip: "35.245.27.193:50211", node: "0.0.5" },
    { ip: "52.20.18.86:50211", node: "0.0.5" },
    { ip: "34.83.112.116:50211", node: "0.0.6" },
    { ip: "54.70.192.33:50211", node: "0.0.6" },
    { ip: "34.94.160.4:50211", node: "0.0.7" },
    { ip: "54.176.199.109:50211", node: "0.0.7" },
    { ip: "35.155.49.147:50211", node: "0.0.8" },
    { ip: "34.106.102.218:50211", node: "0.0.8" },
    { ip: "34.133.197.230:50211", node: "0.0.9" },
    { ip: "52.14.252.207:50211", node: "0.0.9" },
    //localNode
    { ip: "127.0.0.1:50211", node: "0.0.3" },
    //previewNet
    { ip: "3.211.248.172:50211", node: "0.0.3" },
    { ip: "35.231.208.148:50211", node: "0.0.3" },
    { ip: "35.199.15.177:50211", node: "0.0.4" },
    { ip: "3.133.213.146:50211", node: "0.0.4" },
    { ip: "35.225.201.195:50211", node: "0.0.5" },
    { ip: "52.15.105.130:50211", node: "0.0.5" },
    { ip: "54.241.38.1:50211", node: "0.0.6" },
    { ip: "35.247.109.135:50211", node: "0.0.6" },
    { ip: "54.177.51.127:50211", node: "0.0.7" },
    { ip: "35.235.65.51:50211", node: "0.0.7" },
    { ip: "34.106.247.65:50211", node: "0.0.8" },
    { ip: "35.83.89.171:50211", node: "0.0.8" },
    { ip: "50.18.17.93:50211", node: "0.0.9" },
    { ip: "34.125.23.49:50211", node: "0.0.9" },
];

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
                "grpc.keepalive_time_ms": 100000,
                "grpc.keepalive_timeout_ms": 10000,
                "grpc.keepalive_permit_without_calls": 1,
                "grpc.enable_retries": 0,
            };
        } else {
            security = credentials.createInsecure();
            options = {
                "grpc.keepalive_time_ms": 100000,
                "grpc.keepalive_timeout_ms": 10000,
                "grpc.keepalive_permit_without_calls": 1,
                "grpc.enable_retries": 0,
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
        return (method, requestData, callback) => {
            const deadline = new Date();
            const milliseconds = this.maxExecutionTime
                ? this.maxExecutionTime
                : 10000;
            deadline.setMilliseconds(deadline.getMilliseconds() + milliseconds);

            // For presentational purposes
            // const nodeInfo = allNetworkIps.find(
            //     (ip) =>
            //         ip.ip === this._client.getChannel().getChannelzRef().name,
            // );

            // console.log("Account Node Id ->", nodeInfo?.node);

            this._client.waitForReady(deadline, (err) => {
                if (err) {
                    callback(new GrpcServicesError(GrpcStatus.Timeout));
                } else {
                    this._client.makeUnaryRequest(
                        `/proto.${serviceName}/${method.name}`,
                        (value) => value,
                        (value) => {
                            return value;
                        },
                        Buffer.from(requestData),
                        (e, r) => {
                            callback(e, r);
                        },
                    );
                }
            });
        };
    }
}
