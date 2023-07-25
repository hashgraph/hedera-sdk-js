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

import ContractId from "./ContractId.js";
import Long from "long";
import * as protos from "@hashgraph/proto";
const { proto } = protos;

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IContractNonceInfo} HashgraphProto.proto.IContractNonceInfo
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 * @typedef {object} ContractNonceInfoJSON
 * @property {string} contractId
 * @property {number} nonce
 */

/**
 * Info about a contract account's nonce value.
 * A nonce of a contract is only incremented when that contract creates another contract.
 */
export default class ContractNonceInfo {
    /**
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {Long} props.nonce
     */
    constructor(props) {
        /**
         * Id of the contract
         *
         * @readonly
         */
        this.contractId = props.contractId;

        /**
         * The current value of the contract account's nonce property
         *
         * @readonly
         */
        this.nonce = props.nonce;

        Object.freeze(this);
    }

    /**
     *  Extract the contractNonce from the protobuf.
     *
     * @internal
     * @param {HashgraphProto.proto.IContractNonceInfo} contractNonceInfo the protobuf
     * @returns {ContractNonceInfo} the contract object
     */
    static _fromProtobuf(contractNonceInfo) {
        return new ContractNonceInfo({
            contractId: ContractId._fromProtobuf(
                /** @type {HashgraphProto.proto.IContractID} */ (
                    contractNonceInfo.contractId
                )
            ),
            nonce:
                contractNonceInfo.nonce != null
                    ? contractNonceInfo.nonce
                    : Long.ZERO,
        });
    }

    /**
     * Build the protobuf
     *
     * @internal
     * @returns {HashgraphProto.proto.IContractNonceInfo} the protobuf representation
     */
    _toProtobuf() {
        return {
            contractId: this.contractId._toProtobuf(),
            nonce: this.nonce,
        };
    }

    /**
     * Extract the contractNonce from a byte array.
     *
     * @param {Uint8Array} bytes the byte array
     * @returns {ContractNonceInfo} the extracted contract nonce info
     */
    static fromBytes(bytes) {
        return ContractNonceInfo._fromProtobuf(
            proto.ContractNonceInfo.decode(bytes)
        );
    }

    /**
     * Create a byte array representation.
     *
     * @returns {Uint8Array} the byte array representation
     */
    toBytes() {
        return proto.ContractNonceInfo.encode(this._toProtobuf()).finish();
    }

    /**
     * Create a JSON representation.
     *
     * @returns {ContractNonceInfoJSON} the JSON representation
     */
    toJSON() {
        return {
            contractId: this.contractId.toString(),
            nonce: this.nonce.toNumber(),
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other) {
        return (
            this.contractId.equals(other.contractId) &&
            this.nonce.eq(other.nonce)
        );
    }
}
