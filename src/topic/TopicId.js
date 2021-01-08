import * as entity_id from "../EntityIdHelper.js";
import { TopicID as ProtoTopicID } from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITopicID} proto.ITopicID
 */

/**
 * Unique identifier for a topic (used by the consensus service).
 */
export default class TopicId {
    /**
     * @param {number | Long | import("../EntityIdHelper.js").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        const [shard_num, realm_num, topic_num] = entity_id.constructor(
            props,
            realm,
            num
        );

        this.shard = shard_num;
        this.realm = realm_num;
        this.num = topic_num;
    }

    /**
     * @param {string} text
     * @returns {TopicId}
     */
    static fromString(text) {
        return new TopicId(...entity_id.fromString(text));
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
        return ProtoTopicID.encode(this._toProtobuf()).finish();
    }
}
