import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * The ID for a crypto-currency file on Hedera.
 */
export default class FileId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId").IEntityId} properties
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(properties, realm, num) {
        super(properties, realm, num);
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
            shard: id.shardNum ?? 0,
            realm: id.realmNum ?? 0,
            num: id.fileNum ?? 0,
        });
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
}
