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

import ObjectMap from "../ObjectMap.js";
import PublicKey from "../PublicKey.js";

/**
 * @augments {ObjectMap<PublicKey, Uint8Array>}
 */
export default class NodeAccountIdSignatureMap extends ObjectMap {
    constructor() {
        super((s) => PublicKey.fromString(s));
    }

    /**
     * @param {import("@hashgraph/proto").proto.ISignatureMap} sigMap
     * @returns {NodeAccountIdSignatureMap}
     */
    static _fromTransactionSigMap(sigMap) {
        const signatures = new NodeAccountIdSignatureMap();

        const sigPairs = sigMap.sigPair != null ? sigMap.sigPair : [];

        for (const sigPair of sigPairs) {
            if (sigPair.pubKeyPrefix != null) {
                if (sigPair.ed25519 != null) {
                    signatures._set(
                        PublicKey.fromBytesED25519(sigPair.pubKeyPrefix),
                        sigPair.ed25519
                    );
                } else if (sigPair.ECDSASecp256k1 != null) {
                    signatures._set(
                        PublicKey.fromBytesECDSA(sigPair.pubKeyPrefix),
                        sigPair.ECDSASecp256k1
                    );
                }
            }
        }

        return signatures;
    }
}
