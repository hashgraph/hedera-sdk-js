import * as entity_id from "../EntityIdHelper.js";
import { TopicID as ProtoTopicID } from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
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
     */
    constructor(props, realm, num) {
        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {string} text
     * @returns {TopicId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new TopicId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {proto.ITopicID} id
     * @param {(string | null)=} ledgerId
     * @returns {TopicId}
     */
    static _fromProtobuf(id, ledgerId) {
        const topicId = new TopicId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.topicNum != null ? id.topicNum : 0
        );

        if (ledgerId != null) {
            topicId._setNetwork(ledgerId);
        }

        return topicId;
    }

    /**
     * @internal
     * @param {Client} client
     */
    _setNetworkWith(client) {
        if (client._network._ledgerId != null) {
            this._setNetwork(client._network._ledgerId);
        }
    }

    /**
     * @internal
     * @param {string} ledgerId
     */
    _setNetwork(ledgerId) {
        this._checksum = entity_id._checksum(
            ledgerId,
            `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
        );
    }

    /**
     * @param {Client} client
     */
    validate(client) {
        if (
            client._network._ledgerId != null &&
            this._checksum != null &&
            this._checksum !=
                entity_id._checksum(
                    client._network._ledgerId,
                    `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
                )
        ) {
            throw new Error("Entity ID is for a different network than client");
        }
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

    /**
     * @returns {TopicId}
     */
    clone() {
        const id = new TopicId(this);
        id._checksum = this._checksum;
        return id;
    }
}
