import {FileID} from "../generated/BasicTypes_pb";

/** Normalized file ID returned by various methods in the SDK. */
export type FileId = { shard: number; realm: number; file: number };

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
    | number;

export function fileIdToSdk(fileId: FileID): FileId {
    return {
        shard: fileId.getShardnum(),
        realm: fileId.getRealmnum(),
        file: fileId.getFilenum()
    };
}