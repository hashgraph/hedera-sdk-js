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

import CACHE from "./Cache.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.IKey} HashgraphProto.proto.IKey
 */

export default class Key {
    /**
     * @internal
     * @abstract
     * @returns {HashgraphProto.proto.IKey}
     */
    // eslint-disable-next-line jsdoc/require-returns-check
    _toProtobufKey() {
        throw new Error("not implemented");
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IKey} key
     * @returns {Key}
     */
    static _fromProtobufKey(key) {
        if (key.contractID != null) {
            return CACHE.contractId(key.contractID);
        }

        if (key.delegatableContractId != null) {
            return CACHE.delegateContractId(key.delegatableContractId);
        }

        if (key.ed25519 != null && key.ed25519.byteLength > 0) {
            return CACHE.publicKeyED25519(key.ed25519);
        }

        if (key.ECDSASecp256k1 != null && key.ECDSASecp256k1.byteLength > 0) {
            return CACHE.publicKeyECDSA(key.ECDSASecp256k1);
        }

        if (key.thresholdKey != null && key.thresholdKey.threshold != null) {
            return CACHE.thresholdKey(key.thresholdKey);
        }

        if (key.keyList != null) {
            return CACHE.keyList(key.keyList);
        }

        // @ts-ignore
        return null;

        /* throw new Error(
            `(BUG) keyFromProtobuf: not implemented key case: ${JSON.stringify(
                key
            )}`
        ); */
    }
}
