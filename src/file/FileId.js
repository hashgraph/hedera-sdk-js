import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long")} Long
 */

/**
 * The ID for a crypto-currency file on Hedera.
 */
export default class FileId {
    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        const [shard_num, realm_num, file_num] = entity_id.constructor(
            props,
            realm,
            num
        );

        this.shard = shard_num;
        this.realm = realm_num;
        this.num = file_num;
    }

    /**
     * @param {string} text
     * @returns {FileId}
     */
    static fromString(text) {
        return new FileId(...entity_id.fromString(text));
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
     * @override
     * @returns {string}
     */
    toString() {
        return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.FileID.encode(this._toProtobuf()).finish();
    }
}
