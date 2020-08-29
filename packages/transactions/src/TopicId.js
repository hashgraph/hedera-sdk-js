import { root } from "../generated/proto.js";
import * as hex from "@hashgraph/cryptography/encoding/hex.js";
import { normalizeEntityId } from "./util.js";

/**
 * Input type for an ID of a topic on the network.
 *
 * In any form, `shard` and `realm` are assumed to be 0 if not provided.
 *
 * Strings may take the form `'<shard>.<realm>.<topic>'` or `'<topic>'`.
 *
 * A bare `number` will be taken as the topic number with shard and realm of 0.
 *
 * @typedef {{ shard?: number; realm?: number; topic: number } | string | number | TopicId} TopicIdLike
 */

/** Normalized topic ID returned by various methods in the SDK. */
export default class TopicId {
    /**
     * @param {TopicIdLike} shardOrTopicId
     * @param {number | undefined} realm
     * @param {number | undefined} topic
     */
    constructor(shardOrTopicId, realm, topic) {
        if (
            typeof shardOrTopicId === "number" &&
            realm != null &&
            topic != null
        ) {
            /**
             * @type {number}
             */
            this.shard = shardOrTopicId;

            /**
             * @type {number}
             */
            this.realm = realm;

            /**
             * @type {number}
             */
            this.topic = topic;
        } else {
            const topicId = shardOrTopicId;
            const id =
                topicId instanceof TopicId
                    ? topicId
                    : normalizeEntityId("topic", topicId);

            this.shard = id.shard ?? 0;
            this.realm = id.realm ?? 0;
            this.topic = id instanceof TopicId ? id.topic : id.entity;
        }
    }

    /**
     * @param {string} id
     * @returns {TopicId}
     */
    static fromString(id) {
        return new TopicId(id, undefined, undefined);
    }

    /**
     * NOT A STABLE API
     *
     * @param {root.proto.TopicID} topicId
     * @param topicId
     * @returns {TopicId}
     */
    static _fromProtobuf(topicId) {
        return new TopicId({
            shard: topicId.getShardnum(),
            realm: topicId.getRealmnum(),
            topic: topicId.getTopicnum(),
        }, undefined, undefined);
    }

    /**
     * @returns {string}
     */
    toString() {
        return `${this.shard}.${this.realm}.${this.topic}`;
    }

    // /**
    //  * @param {string} address
    //  * @returns {TopicId}
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
    //     const topic = new BigNumber(address.slice(24, 40), 16).toNumber();

    //     return new TopicId(shard, realm, topic);
    // }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        const buffer = new Uint8Array(20);
        const view = new DataView(buffer.buffer, 0, 20);

        view.setUint32(0, this.shard);
        view.setUint32(8, this.realm);
        view.setUint32(16, this.topic);

        return hex.encode(buffer);
    }

    /**
     * NOT A STABLE API
     *
     * @returns {root.proto.TopicID}
     */
    _toProtobuf() {
        const proto = new root.proto.TopicID();
        proto.setShardnum(this.shard);
        proto.setRealmnum(this.realm);
        proto.setTopicnum(this.topic);
        return proto;
    }
}
