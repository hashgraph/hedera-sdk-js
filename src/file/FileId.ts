import { FileID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";

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

    public constructor(fileId: FileIdLike) {
        const id = fileId instanceof FileId ?
            fileId :
            normalizeEntityId("file", fileId);

        this.shard = id.shard;
        this.realm = id.realm;
        this.file = id.file;
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
