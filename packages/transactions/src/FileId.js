import { root } from "../generated/proto.js";
import * as hex from "@hashgraph/cryptography/encoding/hex.js";
import { normalizeEntityId } from "./util.js";

/**
 * Input type for an ID of a file on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<file>'` or `'<file>'`.
 *
 * A bare `number` will be taken as the file number with shard and realm of 0.
 *
 * @typedef {{ shard?: number; realm?: number; file: number } | string | number | FileId} FileIdLike
 */

/** Normalized file ID returned by various methods in the SDK. */
export default class FileId {
    /**
     * @param {FileIdLike} shardOrFileId
     * @param {number | undefined} realm
     * @param {number | undefined} file
     */
    constructor(shardOrFileId, realm, file) {
        if (
            typeof shardOrFileId === "number" &&
            realm != null &&
            file != null
        ) {
            /**
             * @type {number}
             */
            this.shard = shardOrFileId;

            /**
             * @type {number}
             */
            this.realm = realm;

            /**
             * @type {number}
             */
            this.file = file;
        } else {
            const fileId = shardOrFileId;
            const id =
                fileId instanceof FileId
                    ? fileId
                    : normalizeEntityId("file", fileId);

            this.shard = id.shard ?? 0;
            this.realm = id.realm ?? 0;
            this.file = id instanceof FileId ? id.file : id.entity;
        }
    }

    /**
     * @param {string} id
     * @returns {FileId}
     */
    static fromString(id) {
        return new FileId(id, undefined, undefined);
    }

    /**
     * NOT A STABLE API
     *
     * @param {root.proto.FileID} fileId
     * @param fileId
     * @returns {FileId}
     */
    static _fromProtobuf(fileId) {
        return new FileId({
            shard: fileId.getShardnum(),
            realm: fileId.getRealmnum(),
            file: fileId.getFilenum(),
        }, undefined, undefined);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.shard}.${this.realm}.${this.file}`;
    }

    // /**
    //  * @param {string} address
    //  * @returns {FileId}
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
    //     const file = new BigNumber(address.slice(24, 40), 16).toNumber();

    //     return new FileId(shard, realm, file);
    // }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.file);

        return hex.encode(buffer);
    }

    /**
     * NOT A STABLE API
     *
     * @returns {root.proto.FileID}
     */
    _toProtobuf() {
        const proto = new root.proto.FileID();
        proto.setShardnum(this.shard);
        proto.setRealmnum(this.realm);
        proto.setFilenum(this.file);
        return proto;
    }
}
