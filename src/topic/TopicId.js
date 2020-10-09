import EntityId, { fromString } from "../EntityId.js";
import { TopicID as ProtoTopicID } from "@hashgraph/proto";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITopicID} proto.ITopicID
 */

/**
 * @typedef {import("long")} Long
 */

/**
 * Unique identifier for a topic (used by the consensus service).
 *
 * @augments {EntityId<proto.ITopicID>}
 */
export default class TopicId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId.js").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        super(props, realm, num);
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
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.topicNum != null ? id.topicNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TopicId}
     */
    static fromBytes(bytes) {
        return TopicId._fromProtobuf(ProtoTopicID.decode(bytes));
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
        return ProtoTopicID.encode(this._toProtobuf()).finish();
    }
}
