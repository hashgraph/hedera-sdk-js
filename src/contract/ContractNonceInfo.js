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

import ContractId from "./ContractId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IContractLoginfo} HashgraphProto.proto.IContractLoginfo
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
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
}
