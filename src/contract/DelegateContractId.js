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

import CACHE from "../Cache.js";
import ContractId from "./ContractId.js";
import * as hex from "../encoding/hex.js";

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 */

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

export default class DelegateContractId extends ContractId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {Uint8Array=} evmAddress
     */
    constructor(props, realm, num, evmAddress) {
        super(props, realm, num, evmAddress);
    }

    /**
     * @param {Long | number} shard
     * @param {Long | number} realm
     * @param {string} evmAddress
     * @returns {ContractId}
     */
    static fromEvmAddress(shard, realm, evmAddress) {
        return new DelegateContractId(shard, realm, 0, hex.decode(evmAddress));
    }

    /**
     * @param {string} text
     * @returns {DelegateContractId}
     */
    static fromString(text) {
        return new DelegateContractId(ContractId.fromString(text));
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IContractID} id
     * @returns {DelegateContractId}
     */
    static _fromProtobuf(id) {
        return new DelegateContractId(ContractId._fromProtobuf(id));
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {DelegateContractId}
     */
    static fromBytes(bytes) {
        return new DelegateContractId(ContractId.fromBytes(bytes));
    }

    /**
     * @param {string} address
     * @returns {DelegateContractId}
     */
    static fromSolidityAddress(address) {
        // eslint-disable-next-line deprecation/deprecation
        return new DelegateContractId(ContractId.fromSolidityAddress(address));
    }

    /**
     * @returns {DelegateContractId}
     */
    clone() {
        const id = new DelegateContractId(this);
        id._checksum = this._checksum;
        return id;
    }

    /**
     * @returns {HashgraphProto.proto.IKey}
     */
    _toProtobufKey() {
        return {
            delegatableContractId: this._toProtobuf(),
        };
    }

    /**
     * @param {HashgraphProto.proto.IContractID} key
     * @returns {DelegateContractId}
     */
    static __fromProtobufKey(key) {
        return DelegateContractId._fromProtobuf(key);
    }
}

CACHE.setDelegateContractId((key) => DelegateContractId.__fromProtobufKey(key));
