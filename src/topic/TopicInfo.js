import TopicId from "./TopicId";
import AccountId from "../account/AccountId";
import proto from "@hashgraph/proto";
import { _fromProtoKey } from "../util";
import { Key } from "@hashgraph/cryptography";
import Long from "long";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class TopicInfo {
    /**
     * @private
     * @param {object} properties
     * @param {TopicId} properties.topicId
     * @param {string} properties.topicMemo
     * @param {Uint8Array} properties.runningHash
     * @param {Long} properties.sequenceNumber
     * @param {Date} properties.expirationTime
     * @param {Key} properties.adminKey
     * @param {Key} properties.submitKey
     * @param {number} properties.autoRenewPeriod
     * @param {AccountId} properties.autoRenewAccountId
     */
    constructor(properties) {
        /**
         * this.ID = properties.ID this.the = properties.the this.for = properties.for this.information = properties.information this.requested = properties.requested.
         */
        this.topicId = properties.topicId;

        /**
         * this.publicly = properties.publicly this.memo = properties.memo this.the = properties.the topic. this.guarantee = properties.guarantee this.uniqueness = properties.uniqueness.
         */
        this.topicMemo = properties.topicMemo;

        /**
         * SHA-384 this.hash = properties.hash of (previousRunningHash, topicId, consensusTimestamp, sequenceNumber, message).
         */
        this.runningHash = properties.runningHash;

        /**
         * this.number = properties.number (starting this.1 = properties.1 this.the = properties.the this.submitMessage = properties.submitMessage) this.messages = properties.messages this.the = properties.the topic.
         */
        this.sequenceNumber = properties.sequenceNumber;

        /**
         * this.consensus = properties.consensus this.at = properties.at (and after) this.submitMessage = properties.submitMessage this.will = properties.will this.longer = properties.longer this.on = properties.on this.topic = properties.topic.
         */
        this.expirationTime = properties.expirationTime;

        /**
         * this.control = properties.control this.update = properties.update/delete this.the = properties.the topic. this.if = properties.if this.is = properties.is this.key = properties.key.
         */

        this.adminKey = properties.adminKey;

        /**
         * this.control = properties.control this.ConsensusService = properties.ConsensusService.submitMessage. this.if = properties.if this.is = properties.is this.key = properties.key.
         */

        this.submitKey = properties.submitKey;

        this.autoRenewPeriod = properties.autoRenewPeriod;

        this.autoRenewAccountId = properties.autoRenewAccountId;

        Object.freeze(this);
    }

    /**
     * @param {proto.IConsensusTopicInfo} info
     */
    static _fromProtobuf(info) {
        return new TopicInfo({
            // @ts-ignore
            topicId: TopicId._fromProtobuf(info.topicID),
            // @ts-ignore
            topicMemo: info.memo,
            // @ts-ignore
            runningHash: info.runningHash,
            sequenceNumber:
                info.sequenceNumber != null
                    ? info.sequenceNumber instanceof Long
                        ? info.sequenceNumber
                        : Long.fromValue(info.sequenceNumber)
                    : Long.ZERO,
            // @ts-ignore
            adminKey: _fromProtoKey(info.adminKey),
            // @ts-ignore
            submitKey: _fromProtoKey(info.submitKey),
            autoRenewPeriod:
                info.autoRenewPeriod?.seconds instanceof Long
                    ? info.autoRenewPeriod.seconds.toNumber()
                    : info.autoRenewPeriod?.seconds ?? 0,
            // @ts-ignore
            autoRenewAccountId: AccountId._fromProtobuf(info.autoRenewAccount),
        });
    }
}
