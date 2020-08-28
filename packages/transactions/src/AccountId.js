import { root } from "../generated/proto.js";
import * as hex from "@hashgraph/cryptography/encoding/hex.js";
import { normalizeEntityId } from "./util.js";

/**
 * Input type for an ID of an account on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<account>'` or `'<account>'`.
 *
 * A bare `number` will be taken as the account number with shard and realm of 0.
 *
 * @typedef {{ shard?: number; realm?: number; account: number } | string | number | AccountId} AccountIdLike
 */

/** Normalized account ID returned by various methods in the SDK. */
export default class AccountId {
    /**
     * @param {AccountIdLike} shardOrAccountId
     * @param {number | undefined} realm
     * @param {number | undefined} account
     */
    constructor(shardOrAccountId, realm, account) {
        if (
            typeof shardOrAccountId === "number" &&
            realm != null &&
            account != null
        ) {
            /**
             * @type {number}
             */
            this.shard = shardOrAccountId;

            /**
             * @type {number}
             */
            this.realm = realm;

            /**
             * @type {number}
             */
            this.account = account;
        } else {
            const accountId = shardOrAccountId;
            const id =
                accountId instanceof AccountId
                    ? accountId
                    : normalizeEntityId("account", accountId);

            this.shard = id.shard ?? 0;
            this.realm = id.realm ?? 0;
            this.account = id instanceof AccountId ? id.account : id.entity;
        }
    }

    /**
     * @param {string} id
     * @returns {AccountId}
     */
    static fromString(id) {
        return new AccountId(id, undefined, undefined);
    }

    /**
     * NOT A STABLE API
     *
     * @param {root.proto.AccountID} accountId
     * @param accountId
     * @returns {AccountId}
     */
    static _fromProtobuf(accountId) {
        return new AccountId({
            shard: accountId.getShardnum(),
            realm: accountId.getRealmnum(),
            account: accountId.getAccountnum(),
        }, undefined, undefined);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.shard}.${this.realm}.${this.account}`;
    }

    // /**
    //  * @param {string} address
    //  * @returns {AccountId}
    //  */
    // static fromSolidityAddress(address) {
    //     if (address.length !== 40) {
    //         throw new Error(`Invalid hex encoded solidity address length:
    //                 expected length 40, got length ${address.length}`);
    //     }

    //     // First 4 bytes encoded as 8 characters
    //     const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
    //     // Next 8 bytes encoded as 16 characters
    //     const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
    //     // Next 8 bytes encoded as 16 characters
    //     const account = new BigNumber(address.slice(24, 40), 16).toNumber();

    //     return new AccountId(shard, realm, account);
    // }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.account);

        return hex.encode(buffer);
    }

    /**
     * NOT A STABLE API
     *
     * @returns {root.proto.AccountID}
     */
    _toProtobuf() {
        const acctId = new root.proto.AccountID();
        acctId.setShardnum(this.shard);
        acctId.setRealmnum(this.realm);
        acctId.setAccountnum(this.account);
        return acctId;
    }
}
