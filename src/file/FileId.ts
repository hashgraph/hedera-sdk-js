import { FileID } from "../generated/BasicTypes_pb";
import { idToString, normalizeEntityId } from "../util";

/** Normalized file ID returned by various methods in the SDK. */
export type FileId = { shard: number; realm: number; file: number; toString(): string };

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

export function fileIdToSdk(fileId: FileID): FileId {
    return {
        shard: fileId.getShardnum(),
        realm: fileId.getRealmnum(),
        file: fileId.getFilenum(),
        toString() {
            return idToString({ shard: this.shard, realm: this.realm, num: this.file });
        }
    };
}

export function fileIdToProto(fileIdLike: FileIdLike): FileID {
    const { shard, realm, file } = normalizeFileId(fileIdLike);
    const fileId = new FileID();
    fileId.setShardnum(shard);
    fileId.setRealmnum(realm);
    fileId.setFilenum(file);
    return fileId;
}

export function normalizeFileId(fileId: FileIdLike): FileId {
    return normalizeEntityId("file", fileId);
}
