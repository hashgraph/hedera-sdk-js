import { TokenID } from "../generated/basic_types_pb";
import { normalizeEntityId } from "../util";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";
import { NftId } from "./NftId";

/** Normalized token ID returned by various methods in the SDK. */
export class TokenId {
    public shard: number;
    public realm: number;
    public token: number;

    public constructor(shard: number, realm: number, token: number);
    public constructor(tokenId: TokenIdLike);
    public constructor(
        shardOrTokenId: TokenIdLike,
        realm?: number,
        token?: number
    ) {
        if (
            typeof shardOrTokenId === "number" &&
            realm != null &&
            token != null
        ) {
            this.shard = shardOrTokenId as number;
            this.realm = realm!;
            this.token = token!;
        } else {
            const tokenId = shardOrTokenId as TokenIdLike;
            const id =
                tokenId instanceof TokenId ?
                    tokenId :
                    normalizeEntityId("token", tokenId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.token = id.token;
        }
    }

    public static fromString(id: string): TokenId {
        return new TokenId(id);
    }

    // NOT A STABLE API
    public static _fromProto(tokenId: TokenID): TokenId {
        return new TokenId({
            shard: new BigNumber(tokenId.getShardnum()).toNumber(),
            realm: new BigNumber(tokenId.getRealmnum()).toNumber(),
            token: new BigNumber(tokenId.getTokennum()).toNumber()
        });
    }

    public nft(serial: BigNumber): NftId {
        return new NftId(this, serial);
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.token}`;
    }

    public static fromSolidityAddress(address: string): TokenId {
        if (address.length !== 40) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        // First 4 bytes encoded as 8 characters
        const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const token = new BigNumber(address.slice(24, 40), 16).toNumber();

        return new TokenId(shard, realm, token);
    }

    public toSolidityAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.token);

        return hex.encode(buffer, true);
    }

    // NOT A STABLE API
    public _toProto(): TokenID {
        const acctId = new TokenID();
        acctId.setShardnum(this.shard.toString());
        acctId.setRealmnum(this.realm.toString());
        acctId.setTokennum(this.token.toString());
        return acctId;
    }
}

/**
 * Input type for an ID of an token on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<token>'` or `'<token>'`.
 *
 * A bare `number` will be taken as the token number with shard and realm of 0.
 */
export type TokenIdLike =
    | { shard?: number; realm?: number; token: number }
    | string
    | number
    | TokenId;
