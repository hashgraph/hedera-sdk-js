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

import AccountInfoQuery from "./AccountInfoQuery.js";
import KeyList from "../KeyList.js";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/Transaction.js").default} Transaction
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("./AccountId.js").default} AccountId
 * @typedef {import("../Signer.js").Signer} Signer
 */

export default class AccountInfoFlow {
    /**
     * @param {Client} client
     * @param {AccountId | string} accountId
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {Promise<boolean>}
     */
    static async verifySignature(client, accountId, message, signature) {
        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(client);

        if (info.key instanceof KeyList) {
            return false;
        }

        return /** @type {PublicKey} */ (info.key).verify(message, signature);
    }

    /**
     * @param {Client} client
     * @param {AccountId | string} accountId
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     */
    static async verifyTransaction(client, accountId, transaction) {
        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .execute(client);

        if (info.key instanceof KeyList) {
            return false;
        }

        return /** @type {PublicKey} */ (info.key).verifyTransaction(
            transaction,
        );
    }

    /**
     * @param {Signer} signer
     * @param {AccountId | string} accountId
     * @param {Uint8Array} message
     * @param {Uint8Array} signature
     * @returns {Promise<boolean>}
     */
    static async verifySignatureWithSigner(
        signer,
        accountId,
        message,
        signature,
    ) {
        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .executeWithSigner(signer);

        if (info.key instanceof KeyList) {
            return false;
        }

        return /** @type {PublicKey} */ (info.key).verify(message, signature);
    }

    /**
     * @param {Signer} signer
     * @param {AccountId | string} accountId
     * @param {Transaction} transaction
     * @returns {Promise<boolean>}
     */
    static async verifyTransactionWithSigner(signer, accountId, transaction) {
        const info = await new AccountInfoQuery()
            .setAccountId(accountId)
            .executeWithSigner(signer);

        if (info.key instanceof KeyList) {
            return false;
        }

        return /** @type {PublicKey} */ (info.key).verifyTransaction(
            transaction,
        );
    }
}
