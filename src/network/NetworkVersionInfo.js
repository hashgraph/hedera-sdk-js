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

import SemanticVersion from "./SemanticVersion.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * Response when the client sends the node CryptoGetVersionInfoQuery.
 */
export default class NetworkVersionInfo {
    /**
     * @private
     * @param {object} props
     * @param {SemanticVersion} props.protobufVersion
     * @param {SemanticVersion} props.servicesVesion
     */
    constructor(props) {
        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.protobufVersion = props.protobufVersion;

        /**
         * The account ID for which this information applies.
         *
         * @readonly
         */
        this.servicesVesion = props.servicesVesion;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.INetworkGetVersionInfoResponse} info
     * @returns {NetworkVersionInfo}
     */
    static _fromProtobuf(info) {
        return new NetworkVersionInfo({
            protobufVersion: SemanticVersion._fromProtobuf(
                /** @type {HashgraphProto.proto.ISemanticVersion} */
                (info.hapiProtoVersion)
            ),
            servicesVesion: SemanticVersion._fromProtobuf(
                /** @type {HashgraphProto.proto.ISemanticVersion} */
                (info.hederaServicesVersion)
            ),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.INetworkGetVersionInfoResponse}
     */
    _toProtobuf() {
        return {
            hapiProtoVersion: this.protobufVersion._toProtobuf(),
            hederaServicesVersion: this.servicesVesion._toProtobuf(),
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {NetworkVersionInfo}
     */
    static fromBytes(bytes) {
        return NetworkVersionInfo._fromProtobuf(
            HashgraphProto.proto.NetworkGetVersionInfoResponse.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.NetworkGetVersionInfoResponse.encode(
            this._toProtobuf()
        ).finish();
    }
}
