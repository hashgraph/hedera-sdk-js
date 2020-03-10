import { FileID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";
import BigNumber from "bignumber.js";
import * as hex from "@stablelib/hex";

/** Normalized file ID returned by various methods in the SDK. */
export class FileId {
    public shard: number;
    public realm: number;
    public file: number;

    /**
     * The public node address book for the current network.
     */
    public static readonly ADDRESS_BOOK: FileId = new FileId("0.0.102");

    /**
     * The current fee schedule for the network.
     */
    public static readonly FEE_SCHEDULE: FileId = new FileId("0.0.111");

    /**
     * The current exchange rate of HBAR to USD.
     */
    public static readonly EXCHANGE_RATES: FileId = new FileId("0.0.112");

    public constructor(shard: number, realm: number, file: number);
    public constructor(fileId: FileIdLike);
    public constructor(shardOrFileId: FileIdLike, realm?: number, file?: number) {
        if (typeof shardOrFileId === "number" && realm != null && file != null) {
            this.shard = shardOrFileId as number;
            this.realm = realm!;
            this.file = file!;
        } else {
            const fileId = shardOrFileId as FileIdLike;
            const id = fileId instanceof FileId ?
                fileId :
                normalizeEntityId("file", fileId);

            this.shard = id.shard;
            this.realm = id.realm;
            this.file = id.file;
        }
    }

    public static fromString(id: string): FileId {
        return new FileId(id);
    }

    // NOT A STABLE API
    public static _fromProto(fileId: FileID): FileId {
        return new FileId({
            shard: fileId.getShardnum(),
            realm: fileId.getRealmnum(),
            file: fileId.getFilenum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.file}`;
    }

    public static fromSolidityAddress(address: string): FileId {
        if (address.length !== 40) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        // First 4 bytes encoded as 8 characters
        const shard = new BigNumber(address.slice(0, 8), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const realm = new BigNumber(address.slice(8, 24), 16).toNumber();
        // Next 8 bytes encoded as 16 characters
        const file = new BigNumber(address.slice(24, 40), 16).toNumber();

        return new FileId(shard, realm, file);
    }

    public toSolidityAddress(): string {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.file);

        return hex.encode(buffer, true);
    }

    // NOT A STABLE API
    public _toProto(): FileID {
        const fileId = new FileID();
        fileId.setShardnum(this.shard);
        fileId.setRealmnum(this.realm);
        fileId.setFilenum(this.file);
        return fileId;
    }
}

/**
 * Input type for an ID of a file on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<file>'` or `'<file>'`.
 *
 * A bare `number` will be taken as the file number with shard and realm of 0.
 */
export type FileIdLike =
    { shard?: number; realm?: number; file: number }
    | string
    | number
    | FileId;
