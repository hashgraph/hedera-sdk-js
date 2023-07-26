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

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IContractLoginfo} HashgraphProto.proto.IContractLoginfo
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 */

/**
 * The log information for an event returned by a smart contract function call. One function call
 * may return several such events.
 */
export default class ContractLogInfo {
    /**
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {Uint8Array} props.bloom
     * @param {Uint8Array[]} props.topics
     * @param {Uint8Array} props.data
     */
    constructor(props) {
        /**
         * Address of a contract that emitted the event.
         *
         * @readonly
         */
        this.contractId = props.contractId;

        /**
         * Bloom filter for a particular log.
         *
         * @readonly
         */
        this.bloom = props.bloom;

        /**
         * Topics of a particular event.
         *
         * @readonly
         */
        this.topics = props.topics;

        /**
         * Event data.
         *
         * @readonly
         */
        this.data = props.data;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IContractLoginfo} info
     * @returns {ContractLogInfo}
     */
    static _fromProtobuf(info) {
        return new ContractLogInfo({
            contractId: ContractId._fromProtobuf(
                /** @type {HashgraphProto.proto.IContractID} */ (
                    info.contractID
                )
            ),
            bloom: info.bloom != null ? info.bloom : new Uint8Array(),
            topics: info.topic != null ? info.topic : [],
            data: info.data != null ? info.data : new Uint8Array(),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IContractLoginfo}
     */
    _toProtobuf() {
        return {
            contractID: this.contractId._toProtobuf(),
            bloom: this.bloom,
            topic: this.topics,
            data: this.data,
        };
    }
}
