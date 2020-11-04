import AccountId from "./AccountId.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransferList} proto.ITransferList
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("../long.js").LongObject} LongObject
 * @typedef {import("bignumber.js").default} BigNumber
 */

export default class HbarTransferMap {
    constructor() {
        /** @type {Map<string, Hbar>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._transfers = new Map();

        /** @type {Map<AccountId, Hbar>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__transfers = new Map();
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {?Hbar}
     */
    get(accountId) {
        const account =
            accountId instanceof AccountId ? accountId.toString() : accountId;
        return this._transfers.get(account) || null;
    }

    /**
     * @internal
     * @param {AccountId | string} accountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     */
    _set(accountId, amount) {
        const account =
            accountId instanceof AccountId ? accountId.toString() : accountId;

        const value = amount instanceof Hbar ? amount : new Hbar(amount);

        this._transfers.set(account, value);
        this.__transfers.set(
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId),
            value
        );
    }

    /**
     * @returns {IterableIterator<Hbar>}
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
     * @returns {IterableIterator<[AccountId, Hbar]>}
     */
    [Symbol.iterator]() {
        return this.__transfers[Symbol.iterator]();
    }

    /**
     * @param {proto.ITransferList} transfers
     * @returns {HbarTransferMap}
     */
    static _fromProtobuf(transfers) {
        const accountTransfers = new HbarTransferMap();

        for (const transfer of transfers.accountAmounts != null
            ? transfers.accountAmounts
            : []) {
            const account = AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (transfer.accountID)
            );

            accountTransfers._set(
                account,
                Hbar.fromTinybars(/** @type {Long} */ (transfer.amount))
            );
        }

        return accountTransfers;
    }
}
