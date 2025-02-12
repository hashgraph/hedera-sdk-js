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

/**
 * Represents a mapping of account IDs to their corresponding signatures for transactions.
 *
 * The `SignatureMap` class is used to manage and store signatures associated with
 * different accounts in a transaction. It allows for adding signatures, retrieving
 * them, and converting the signature map to and from various formats.
 */

/**
 * @augments {ObjectMap<AccountId, NodeAccountIdSignatureMap>}
 */
export default class SignatureMap extends ObjectMap {
    /**
     * @typedef {import("../transaction/TransactionId.js").default} TransactionId
     * @typedef {import("../transaction/SignaturePairMap.js").default} SignaturePairMap
     */
    constructor() {
        super((s) => AccountId.fromString(s));
    }

    /**
     * This function is used to create a SignatureMap from an already built transaction.
     * @param {import("./Transaction.js").default} transaction
     * @returns {SignatureMap}
     */
    static _fromTransaction(transaction) {
        const signatures = new SignatureMap();

        const rowLength = transaction._nodeAccountIds.length;
        const columns = transaction._signedTransactions.length / rowLength;

        /*
        this setup implies that the signed transactions are stored sequentially
        in the signed transactions list. This means that the first rowLength
        signed transactions are for the first node account id, the next rowLength
        signed transactions are for the second node account id and so on.
        */
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
     * Updates the signature map with the given signature.
     * by generating a new node account id signature map if it does not exist
     * or adding the signature to the existing node account id signature map.
     *
     * @param {AccountId} nodeId
     * @param {TransactionId} txId
     * @param {import("../SignerSignature.js").PublicKey} publicKey
     * @param {Uint8Array} signature
     * @returns {SignatureMap}
     */
    addSignature(nodeId, txId, publicKey, signature) {
        let nodeAccountIdSigdMap = this.get(nodeId);

        if (!nodeAccountIdSigdMap) {
            nodeAccountIdSigdMap = new NodeAccountIdSignatureMap();
            this._set(nodeId, nodeAccountIdSigdMap);
        }

        nodeAccountIdSigdMap.addSignature(txId, publicKey, signature);
        this._set(nodeId, nodeAccountIdSigdMap);

        return this;
    }
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
