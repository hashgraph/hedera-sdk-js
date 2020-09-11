import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";
import * as hex from "../encoding/hex";

/**
 * Unique identifier for a topic (used by the consensus service).
 *
 * @augments {EntityId<proto.ITopicID>}
 */
export default class TopicId extends EntityId {
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
     * @returns {TopicId}
     */
    static fromString(text) {
        return new TopicId(...fromString(text));
    }

    /**
     * @param {proto.ITopicID} id
     * @returns {TopicId}
     */
    static _fromProtobuf(id) {
        return new TopicId({
            shard: (id.shardNum != null) ? id.shardNum : 0,
            realm: (id.realmNum != null) ? id.realmNum : 0,
            num: (id.topicNum != null) ? id.topicNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TopicId}
     */
    static fromBytes(bytes) {
        return TopicId._fromProtobuf(proto.TopicID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {TopicId}
     */
    static fromSolidityAddress(address) {
        const addr = address.startsWith("0x")
            ? hex.decode(address.slice(2))
            : hex.decode(address);

        if (addr.length !== 20) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        const shard = Long.fromBytesBE(Array.from(addr.slice(0, 4)));
        const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
        const topic = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

        return new TopicId(shard, realm, topic);
    }

    /**
     * @override
     * @returns {proto.ITopicID}
     */
    _toProtobuf() {
        return {
            topicNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TopicID.encode(this._toProtobuf()).finish();
    }
}
