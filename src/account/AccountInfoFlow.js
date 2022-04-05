import AccountInfoQuery from "./AccountInfoQuery.js";
import KeyList from "../KeyList.js";

/**
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/Transaction.js").default} Transaction
 * @typedef {import("../PublicKey.js").default} PublicKey
 * @typedef {import("./AccountId.js").default} AccountId
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
            transaction
        );
    }
}
