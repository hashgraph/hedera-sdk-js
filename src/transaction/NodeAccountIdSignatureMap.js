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

import ObjectMap from "../ObjectMap.js";
import TransactionId from "./TransactionId.js";
import SignaturePairMap from "./SignaturePairMap.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @augments {ObjectMap<TransactionId, SignaturePairMap>}
 */
export default class NodeAccountIdSignatureMap extends ObjectMap {
    constructor() {
        super((s) => TransactionId.fromString(s));
    }

    /**
     * This function is used to create a NodeAccountIdSignaturemap from an already built transaction.
     * @param { import('./List.js').default<import("@hashgraph/proto").proto.ISignedTransaction>} signedTransactions
     * @returns {NodeAccountIdSignatureMap}
     */
    static _fromSignedTransactions(signedTransactions) {
        const signatures = new NodeAccountIdSignatureMap();

        for (const { bodyBytes, sigMap } of signedTransactions.list) {
            if (bodyBytes != null && sigMap != null) {
                const body =
                    HashgraphProto.proto.TransactionBody.decode(bodyBytes);

                if (body.transactionID != null) {
                    const transactionId = TransactionId._fromProtobuf(
                        body.transactionID,
                    );

                    signatures._set(
                        transactionId,
                        SignaturePairMap._fromTransactionSigMap(sigMap),
                    );
                }
            }
        }

        return signatures;
    }

    /**
     *
     * Adds a signature pair for this transaction id.
     * @param {TransactionId} txId
     * @param {import("../SignerSignature.js").PublicKey} publicKey
     * @param {Uint8Array} signature
     */
    addSignature(txId, publicKey, signature) {
        const sigPairMap = this.get(txId);
        if (sigPairMap) {
            sigPairMap.addSignature(publicKey, signature);
        } else {
            this._set(
                txId,
                new SignaturePairMap().addSignature(publicKey, signature),
            );
        }
    }
}
