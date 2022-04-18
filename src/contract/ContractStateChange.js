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

import * as HashgraphProto from "@hashgraph/proto";
import ContractId from "./ContractId.js";
import StorageChange from "./StorageChange.js";

export default class ContractStateChange {
    /**
     * @private
     * @param {object} props
     * @param {ContractId} props.contractId
     * @param {StorageChange[]} props.storageChanges
     */
    constructor(props) {
        this.contractId = props.contractId;
        this.storageChanges = props.storageChanges;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IContractStateChange} change
     * @returns {ContractStateChange}
     */
    static _fromProtobuf(change) {
        return new ContractStateChange({
            contractId: ContractId._fromProtobuf(
                /** @type {HashgraphProto.proto.IContractID} */ (
                    change.contractID
                )
            ),
            storageChanges: (change.storageChanges != null
                ? change.storageChanges
                : []
            ).map((change) => StorageChange._fromProtobuf(change)),
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ContractStateChange}
     */
    static fromBytes(bytes) {
        return ContractStateChange._fromProtobuf(
            HashgraphProto.proto.ContractStateChange.decode(bytes)
        );
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IContractStateChange} change
     */
    _toProtobuf() {
        const storageChanges = this.storageChanges.map((storageChange) =>
            storageChange._toProtobuf()
        );
        return {
            contractID: this.contractId._toProtobuf(),
            storageChanges,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.ContractStateChange.encode(
            this._toProtobuf()
        ).finish();
    }
}
