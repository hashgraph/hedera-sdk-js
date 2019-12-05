import { AccountID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";

/** Normalized account ID returned by various methods in the SDK. */
export class AccountId {
    public shard: number;
    public realm: number;
    public account: number;

    public constructor(accountId: AccountIdLike) {
        const id = accountId instanceof AccountId ?
            accountId :
            normalizeEntityId("account", accountId);

        this.shard = id.shard;
        this.realm = id.realm;
        this.account = id.account;
    }

    public static fromString(id: string): AccountId {
        return new AccountId(id);
    }

    public static fromProto(accountId: AccountID): AccountId {
        return new AccountId({
            shard: accountId.getShardnum(),
            realm: accountId.getRealmnum(),
            account: accountId.getAccountnum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.account}`;
    }

    public toProto(): AccountID {
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
