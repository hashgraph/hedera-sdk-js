import AccountId from "../account/AccountId.js";
import proto from "@hashgraph/proto";
import * as sha384 from "../cryptography/sha384.js";

export default class TransactionHashMap {
    /**
     * @param {Map<string, Uint8Array>} hashes
     */
    constructor(hashes) {
        this._hashes = hashes;
    }

    /**
     * @param {import("./Transaction.js").default} transaction
     * @returns {Promise<TransactionHashMap>}
     */
    static async _fromTransaction(transaction) {
        const length = transaction._nodeIds.length;
        const hashes = new Map();

        for (let i = 0; i < length; i++) {
            const nodeAccountId = transaction._nodeIds[i];
            const tx = transaction._transactions[i];
            const hash = await sha384.digest(
                proto.Transaction.encode(tx).finish()
            );

            hashes.set(nodeAccountId.toString(), hash);
        }

        return new TransactionHashMap(hashes);
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {?Uint8Array}
     */
    get(accountId) {
        const id =
            accountId instanceof AccountId ? accountId.toString() : accountId;

        return this._hashes.get(id) || null;
    }

    /**
     * @returns {IterableIterator<Uint8Array>}
     */
    values() {
        return this._hashes.values();
    }

    /**
     * @returns {IterableIterator<AccountId>}
     */
    keys() {
        const keys = [];
        for (const key of this._hashes.keys()) {
            keys.push(AccountId.fromString(key));
        }
        return keys[Symbol.iterator]();
    }

    /**
     * @returns {IterableIterator<[AccountId, Uint8Array]>}
     */
    [Symbol.iterator]() {
        /**
         * @type {Map<AccountId, Uint8Array>}
         */
        const map = new Map();

        for (const [key, value] of this._hashes) {
            map.set(AccountId.fromString(key), value);
        }

        return /**@type {IterableIterator<[AccountId, Uint8Array]>} */ (map[
            Symbol.iterator
        ]());
    }
}
