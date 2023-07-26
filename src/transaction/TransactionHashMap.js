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

import AccountId from "../account/AccountId.js";
import * as sha384 from "../cryptography/sha384.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 */

/**
 * @augments {ObjectMap<AccountId, Uint8Array>}
 */
export default class TransactionHashMap extends ObjectMap {
    constructor() {
        super((s) => AccountId.fromString(s));
    }

    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {Promise<TransactionHashMap>}
     */
    static async _fromTransaction(transaction) {
        const hashes = new TransactionHashMap();

        for (let i = 0; i < transaction._nodeAccountIds.length; i++) {
            const nodeAccountId = transaction._nodeAccountIds.list[i];
            const tx = /** @type {HashgraphProto.proto.ITransaction} */ (
                transaction._transactions.get(i)
            );
            const hash = await sha384.digest(
                /** @type {Uint8Array} */ (tx.signedTransactionBytes)
            );

            hashes._set(nodeAccountId, hash);
        }

        return hashes;
    }
}
