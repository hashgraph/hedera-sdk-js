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

import NodeAccountIdSignatureMap from "./NodeAccountIdSignatureMap.js";
import ObjectMap from "../ObjectMap.js";
import AccountId from "../account/AccountId.js";
import List from "./List.js";
import TransactionId from "./TransactionId.js";

/**
 * @augments {ObjectMap<AccountId, NodeAccountIdSignatureMap>}
 */
export default class SignatureMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
    }

    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {SignatureMap}
     */
    static _fromTransaction(transaction) {
        const signatures = new SignatureMap();

        const rowLength = transaction._nodeAccountIds.length;
        const columns = transaction._signedTransactions.length / rowLength;

        for (let row = 0; row < rowLength; row++) {
            /** @type { List<import("@hashgraph/proto").proto.ISignedTransaction> } */
            const signedTransactions = new List();

            for (let col = 0; col < columns; col++) {
                signedTransactions.push(
                    transaction._signedTransactions.get(col * rowLength + row),
                );
            }

            signatures._set(
                transaction._nodeAccountIds.list[row],
                NodeAccountIdSignatureMap._fromSignedTransactions(
                    signedTransactions,
                ),
            );
        }

        return signatures;
    }

    /**
     *
     * @param {AccountId} nodeId
     * @param {TransactionId} txId
     * @param {import("../SignerSignature.js").PublicKey} publicKey
     * @param {Uint8Array} signature
     */
    addSignature(nodeId, txId, publicKey, signature) {
        if (!this.get(nodeId)) {
            this._set(nodeId, new NodeAccountIdSignatureMap());
        }

        const nodeAccountIdSigdMap = this.get(nodeId);
        if (!nodeAccountIdSigdMap) {
            throw new Error("Node Account ID Signature Map not found");
        }

        nodeAccountIdSigdMap.addSignature(txId, publicKey, signature);
        this._set(nodeId, nodeAccountIdSigdMap);
    /**
     * @returns {SignaturePairMap[]}
     */
    getFlatSignatureList() {
        const flatSignatureList = [];

        for (const nodeAccountIdSignatureMap of this.values()) {
            for (const tx of nodeAccountIdSignatureMap.values()) {
                flatSignatureList.push(tx);
            }
        }

        return flatSignatureList;
    }
}
