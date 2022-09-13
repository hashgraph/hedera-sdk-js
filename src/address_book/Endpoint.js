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

import IPv4Address from "./IPv4Address.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IServiceEndpoint} HashgraphProto.proto.IServiceEndpoint
 */

/**
 * @typedef {object} EndPointJson
 * @property {string | null} address
 * @property {string | null} port
 */

export default class EndPoint {
    /**
     * @param {object} props
     * @param {IPv4Address} [props.address]
     * @param {number} [props.port]
     */
    constructor(props = {}) {
        /**
         * @type {IPv4Address | null}
         */
        this._address = null;

        if (props.address != null) {
            this.setAddress(props.address);
        }

        /**
         * @type {number | null}
         */
        this._port = null;

        if (props.port != null) {
            this.setPort(props.port);
        }
    }

    /**
     * @returns {?IPv4Address}
     */
    get address() {
        return this.address;
    }

    /**
     * @param {IPv4Address} address
     * @returns {this}
     */
    setAddress(address) {
        this._address = address;
        return this;
    }

    /**
     * @returns {?number}
     */
    get port() {
        return this._port;
    }

    /**
     * @param {number} port
     * @returns {this}
     */
    setPort(port) {
        this._port = port;
        return this;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IServiceEndpoint} endpoint
     * @returns {EndPoint}
     */
    static _fromProtobuf(endpoint) {
        return new EndPoint({
            address:
                endpoint.ipAddressV4 != null
                    ? IPv4Address._fromProtobuf(endpoint.ipAddressV4)
                    : undefined,
            port: endpoint.port != null ? endpoint.port : undefined,
        });
    }

    /**
     * @returns {HashgraphProto.proto.IServiceEndpoint}
     */
    _toProtobuf() {
        return {
            ipAddressV4:
                this._address != null ? this._address._toProtobuf() : null,
            port: this._port,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this._address != null ? this._address.toString() : ""}:${
            this._port != null ? this._port.toString() : ""
        }`;
    }

    /**
     * @returns {EndPointJson}
     */
    toJSON() {
        return {
            address: this._address != null ? this._address.toString() : null,
            port: this._port != null ? this._port.toString() : null,
        };
    }
}
