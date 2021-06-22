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
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @param {(string | null)=} checksum
     */
    constructor(props, realm, num, networkName, checksum) {
        const result = entity_id.constructor(
            props,
            realm,
            num,
            networkName,
            checksum
        );

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;
        this._networkName = result.networkName;
        this._checksum = result.checksum;

        Object.freeze(this);
    }

    /**
     * @param {string} text
     * @returns {TopicId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        return new TopicId(
            result.shard,
            result.realm,
            result.num,
            result.networkName,
            result.checksum
        );
    }

    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @returns {TopicId}
     */
    static withNetwork(props, realm, num, networkName) {
        return new TopicId(props, realm, num, networkName);
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
        if (this._checksum == null) {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
        } else {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}-${
                this._checksum
            }`;
        }
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return ProtoTopicID.encode(this._toProtobuf()).finish();
    }
}
