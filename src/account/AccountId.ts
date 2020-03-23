import { AccountID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";

/** Normalized account ID returned by various methods in the SDK. */
export class AccountId {
    public shard: number;
    public realm: number;
    public account: number;

    public constructor(shard: number, realm: number, account: number);
    public constructor(accountId: AccountIdLike);
    public constructor(shardOrAccountId: AccountIdLike, realm?: number, account?: number) {
        if (typeof shardOrAccountId === "number" && realm != null && account != null) {
            this.shard = shardOrAccountId as number;
            this.realm = realm!;
            this.account = account!;
        } else {
            const accountId = shardOrAccountId as AccountIdLike;
            const id = accountId instanceof AccountId ?
                accountId :
                normalizeEntityId("account", accountId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.account = id.account;
        }
    }

    public static fromString(id: string): AccountId {
        return new AccountId(id);
    }

    // NOT A STABLE API
    public static _fromProto(accountId: AccountID): AccountId {
        return new AccountId({
            shard: accountId.getShardnum(),
            realm: accountId.getRealmnum(),
            account: accountId.getAccountnum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.account}`;
    }

    public static fromSolidityAddress(address: string): AccountId {
        if (address.length !== 40) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        // First 4 bytes encoded as 8 characters
        const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const account = new BigNumber(address.slice(24, 40), 16).toNumber();

        return new AccountId(shard, realm, account);
    }

    public toSolidityAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.account);

        return hex.encode(buffer, true);
    }

    // NOT A STABLE API
    public _toProto(): AccountID {
        const acctId = new AccountID();
        acctId.setShardnum(this.shard);
        acctId.setRealmnum(this.realm);
        acctId.setAccountnum(this.account);
        return acctId;
    }
}

/**
 * Input type for an ID of an account on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<account>'` or `'<account>'`.
 *
 * A bare `number` will be taken as the account number with shard and realm of 0.
 */
export type AccountIdLike =
    { shard?: number; realm?: number; account: number }
    | string
    | number
    | AccountId;
