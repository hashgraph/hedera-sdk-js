import AccountId from "../account/AccountId.js";

export default class TokenTransferAccountMap {
    constructor() {
        /** @type {Map<string, Long>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._transfers = new Map();

        /** @type {Map<AccountId, Long>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__transfers = new Map();
    }

    /**
     * @param {AccountId} accountId
     * @returns {?Long}
     */
    get(accountId) {
        const account = new AccountId(accountId).toString();
        return this._transfers.get(account) || null;
    }

    /**
     * @param {AccountId} accountId
     * @param {Long} amount
     */
    _set(accountId, amount) {
        const account = accountId.toString();

        this._transfers.set(account, amount);
        this.__transfers.set(accountId, amount);
    }

    /**
     * @returns {IterableIterator<Long>}
     */
    values() {
        return this._transfers.values();
    }

    /**
     * @returns {IterableIterator<AccountId>}
     */
    keys() {
        return this.__transfers.keys();
    }

    /**
     * @returns {IterableIterator<[AccountId, Long]>}
     */
    [Symbol.iterator]() {
        return this.__transfers[Symbol.iterator]();
    }
}
