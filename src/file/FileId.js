import EntityId, { fromString } from "../EntityId.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long")} Long
 */

/**
 * The ID for a crypto-currency file on Hedera.
 *
 * @augments {EntityId<proto.IFileID>}
 */
export default class FileId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        super(props, realm, num);
    }

    /**
     * @param {string} text
     * @returns {FileId}
     */
    static fromString(text) {
        return new FileId(...fromString(text));
    }

    /**
     * @internal
     * @param {proto.IFileID} id
     * @returns {FileId}
     */
    static _fromProtobuf(id) {
        return new FileId({
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.fileNum != null ? id.fileNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FileId}
     */
    static fromBytes(bytes) {
        return FileId._fromProtobuf(proto.FileID.decode(bytes));
    }

    /**
     * @override
     * @internal
     * @returns {proto.IFileID}
     */
    _toProtobuf() {
        return {
            fileNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.FileID.encode(this._toProtobuf()).finish();
    }
}
