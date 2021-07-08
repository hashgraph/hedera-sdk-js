import BigNumber from "bignumber.js";
import { TokenId } from "./TokenId";
import { NftID as ProtoNftId } from "../generated/TokenGetNftInfo_pb";

export class NftId {
    public readonly tokenId: TokenId;
    public readonly serial: BigNumber;

    public constructor(tokenId: TokenId, serial: BigNumber) {
        this.tokenId = tokenId;
        this.serial = serial;
    }

    // NOT A STABLE API
    public static _fromProto(nftId: ProtoNftId): NftId {
        if (!nftId.hasTokenid()) {
            throw new Error("`ProtoNftId` does not have a `TokenId` set");
        }

        const tokenId = TokenId._fromProto(nftId.getTokenid()!);
        const serial = new BigNumber(nftId.getSerialnumber());

        return new NftId(tokenId, serial);
    }

    public static fromString(s: string): NftId {
        const parts = s.split("@");
        if (parts.length !== 2) {
            throw new Error("Invalid NFT ID: expected {shard}.{realm}.{num}@{serial}");
        }

        const tokenId = TokenId.fromString(parts[ 0 ]);
        const serial = new BigNumber(parts[ 1 ]);

        return new NftId(tokenId, serial);
    }

    // NOT A STABLE API
    public _toProto(): ProtoNftId {
        const builder = new ProtoNftId();

        builder.setTokenid(this.tokenId._toProto());
        builder.setSerialnumber(this.serial.toString());

        return builder;
    }
}
