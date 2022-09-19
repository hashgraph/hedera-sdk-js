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

import NodeAddress from "./NodeAddress.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @typedef {import("./NodeAddress.js").NodeAddressJson} NodeAddressJson
 */

/**
 * @typedef {object} NodeAddressBookJson
 * @property {NodeAddressJson[]} nodeAddresses
 */

export default class NodeAddressBook {
    /**
     * @param {object} props
     * @param {NodeAddress[]} [props.nodeAddresses]
     */
    constructor(props = {}) {
        /**
         * @type {NodeAddress[]}
         */
        this._nodeAddresses = [];

        if (props.nodeAddresses != null) {
            this.setNodeAddresses(props.nodeAddresses);
        }
    }

    /**
     * @returns {NodeAddress[]}
     */
    get nodeAddresses() {
        return this._nodeAddresses;
    }

    /**
     * @param {NodeAddress[]} nodeAddresses
     * @returns {this}
     */
    setNodeAddresses(nodeAddresses) {
        this._nodeAddresses = nodeAddresses;
        return this;
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {NodeAddressBook}
     */
    static fromBytes(bytes) {
        return NodeAddressBook._fromProtobuf(
            HashgraphProto.proto.NodeAddressBook.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.INodeAddressBook} nodeAddressBook
     * @returns {NodeAddressBook}
     */
    static _fromProtobuf(nodeAddressBook) {
        return new NodeAddressBook({
            nodeAddresses:
                nodeAddressBook.nodeAddress != null
                    ? nodeAddressBook.nodeAddress.map((nodeAddress) =>
                          NodeAddress._fromProtobuf(nodeAddress)
                      )
                    : undefined,
        });
    }

    /**
     * @returns {HashgraphProto.proto.INodeAddressBook}
     */
    _toProtobuf() {
        return {
            nodeAddress: this._nodeAddresses.map((nodeAddress) =>
                nodeAddress._toProtobuf()
            ),
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {NodeAddressBookJson}
     */
    toJSON() {
        return {
            nodeAddresses: this._nodeAddresses.map((nodeAddress) =>
                nodeAddress.toJSON()
            ),
        };
    }

    toBytes() {
        return HashgraphProto.proto.NodeAddressBook.encode(
            this._toProtobuf()
        ).finish();
    }
}
