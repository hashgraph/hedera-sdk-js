import TokenId from "../token/TokenId.js";
import AccountId from "../account/AccountId.js";
import TokenTransferAccountMap from "./TokenTransferAccountMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenTransferList} proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

export default class TokenTransferMap {
    constructor() {
        /** @type {Map<string, TokenTransferAccountMap>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._transfers = new Map();

        /** @type {Map<TokenId, TokenTransferAccountMap>} */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.__transfers = new Map();
    }

    /**
     * @param {TokenId | string} tokenId
     * @returns {?TokenTransferAccountMap}
     */
    get(tokenId) {
        const token = tokenId instanceof TokenId ? tokenId.toString() : tokenId;

        const value = /** @type {TokenTransferAccountMap | undefined} */ (this._transfers.get(
            token
        ));
        return value != null ? value : null;
    }

    /**
     * @internal
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     */
    _set(tokenId, accountId, amount) {
        const token = tokenId.toString();

        let stringMap = this._transfers.get(token);
        if (stringMap == null) {
            stringMap = new TokenTransferAccountMap();
            this._transfers.set(token, stringMap);
            this.__transfers.set(tokenId, stringMap);
        }

        stringMap._set(accountId, amount);
    }

    /**
     * @returns {IterableIterator<TokenTransferAccountMap>}
     */
    values() {
        return this._transfers.values();
    }

    /**
     * @returns {IterableIterator<TokenId>}
     */
    keys() {
        return this.__transfers.keys();
    }

    /**
     * @returns {IterableIterator<[TokenId, TokenTransferAccountMap]>}
     */
    [Symbol.iterator]() {
        return this.__transfers[Symbol.iterator]();
    }

    /**
     * @param {proto.ITokenTransferList[]} transfers
     * @returns {TokenTransferMap}
     */
    static _fromProtobuf(transfers) {
        const tokenTransfersMap = new TokenTransferMap();

        for (const transfer of transfers) {
            const token = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (transfer.token)
            );

            for (const aa of transfer.transfers != null
                ? transfer.transfers
                : []) {
                const account = AccountId._fromProtobuf(
                    /** @type {proto.IAccountID} */ (aa.accountID)
                );

                tokenTransfersMap._set(
                    token,
                    account,
                    /** @type {Long} */ (aa.amount)
                );
            }
        }

        return tokenTransfersMap;
    }
}
