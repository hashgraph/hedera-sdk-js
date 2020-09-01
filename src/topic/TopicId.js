import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";

/**
 * The ID for a crypto-currency topic on Hedera.
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
            shard: id.shardNum ?? 0,
            realm: id.realmNum ?? 0,
            num: id.topicNum ?? 0,
        });
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
}
