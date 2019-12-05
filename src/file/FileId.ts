import { FileID } from "../generated/BasicTypes_pb";
import { normalizeEntityId } from "../util";

/** Normalized file ID returned by various methods in the SDK. */
export class FileId {
    public shard: number;
    public realm: number;
    public file: number;

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

    public static fromProto(fileId: FileID): FileId {
        return new FileId({
            shard: fileId.getShardnum(),
            realm: fileId.getRealmnum(),
            file: fileId.getFilenum()
        });
    }

    public toString(): string {
        return `${this.shard}.${this.realm}.${this.file}`;
    }

    public toProto(): FileID {
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
