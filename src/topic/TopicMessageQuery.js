import TopicId from "./TopicId";
import TopicMessage from "./TopicMessage";
import Client from "../client/Client";
import proto from "@hashgraph/proto";

export default class TopicMessageQuery {
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
     * @param {Timestamp} [props.startTime]
     * @param {Timestamp} [props.endTime]
     * @param {Long | number} [props.limit]
     */
    constructor(props) {
        /**
         * @type {?TopicId}
         */
        this._topicId = null;

        /**
         * @type {?Timestamp}
         */
        this._startTime = null;

        /**
         * @type {?Timestamp}
         */
        this._endTime = null;

        /**
         * @type {?Long}
         */
        this._limit = null;

        if (props.topicId != null) {
            this.setTopicId(props.topicId);
        }

        if (props.startTime != null) {
            this.setStartTime(props.startTime);
        }

        if (props.endTime != null) {
            this.setEndTime(props.endTime);
        }

        if (props.limit != null) {
            this.setLimit(props.limit);
        }
    }

    /**
     * @returns {?TopicId}
     */
    getTopicId() {
        return this._topicId;
    }

    /**
     * @param {TopicId} topicId
     * @returns {TopicMessageQuery}
     */
    setTopicId(topicId) {
        this._topicId = topicId;
        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    getStartTime() {
        return this._startTime;
    }

    /**
     * @param {Timestamp} startTime
     * @returns {TopicMessageQuery}
     */
    setStartTime(startTime) {
        this._startTime = startTime;
        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    getEndTime() {
        return this._endTime;
    }

    /**
     * @param {Timestamp} endTime
     * @returns {TopicMessageQuery}
     */
    setEndTime(endTime) {
        this._endTime = endTime;
        return this;
    }

    /**
     * @returns {?Long}
     */
    getLimit() {
        return this._limit;
    }

    /**
     * @param {Long | number} limit
     * @returns {TopicMessageQuery}
     */
    setLimit(limit) {
        this._limit = limit instanceof Long ?
            limit :
            Long.fromValue(limit);
        return this;
    }

    /**
     * @param {Client} client
     * @param {(message: TopicMessage) => void} onNext
     * @returns {SubscriptionHandle}
     */
    subscribe(client, onNext) {
        const handle = new SubscriptionHandle();

        makeStreamingCall(client, handle, this._toProtobuf(), onNext, 0);

        return handle;
    }
}

/**
 * @param {Client} client
 * @param {SubscriptionHandle} handle
 * @param {proto.IConsensusTopicQuery} query
 * @param {(message: TopicMessage) => void} onNext
 * @param {number} attempt
 * @returns {void}
 */
function makeStreamingCall(client, handle, query, onNext, attempt) {
    if (attempt > 10) {
        throw new Error("Failed to connect to mirror node");
    }

    /**
     * @type {{ [ id: string]: ConsensusTopicResponse[] | null }}
     */
    const list = {};

    client._mirrorClient

}
