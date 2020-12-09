import TransactionId from "../transaction/TransactionId.js";
import SubscriptionHandle from "./SubscriptionHandle.js";
import TopicMessage from "./TopicMessage.js";
import * as proto from "@hashgraph/proto";
import TopicId from "./TopicId.js";
import Long from "long";
import Timestamp from "../Timestamp.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../channel/MirrorChannel.js").default} MirrorChannel
 */

/**
 * @template {Channel} ChannelT
 * @typedef {import("../client/Client.js").default<ChannelT, MirrorChannel>} Client<ChannelT, MirrorChannel>
 */

export default class TopicMessageQuery {
    /**
     * @param {object} props
     * @param {TopicId | string} [props.topicId]
     * @param {Timestamp} [props.startTime]
     * @param {Timestamp} [props.endTime]
     * @param {Long | number} [props.limit]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?TopicId}
         */
        this._topicId = null;
        if (props.topicId != null) {
            this.setTopicId(props.topicId);
        }

        /**
         * @private
         * @type {?Timestamp}
         */
        this._startTime = null;
        if (props.startTime != null) {
            this.setStartTime(props.startTime);
        }

        /**
         * @private
         * @type {?Timestamp}
         */
        this._endTime = null;
        if (props.endTime != null) {
            this.setEndTime(props.endTime);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._limit = null;
        if (props.limit != null) {
            this.setLimit(props.limit);
        }
    }

    /**
     * @returns {?TopicId}
     */
    get topicId() {
        return this._topicId;
    }

    /**
     * @param {TopicId | string} topicId
     * @returns {TopicMessageQuery}
     */
    setTopicId(topicId) {
        this._topicId =
            topicId instanceof TopicId ? topicId : TopicId.fromString(topicId);

        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    get startTime() {
        return this._startTime;
    }

    /**
     * @param {Timestamp | Date | number} startTime
     * @returns {TopicMessageQuery}
     */
    setStartTime(startTime) {
        this._startTime =
            startTime instanceof Timestamp
                ? startTime
                : startTime instanceof Date
                ? Timestamp.fromDate(startTime)
                : new Timestamp(startTime, 0);
        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    get endTime() {
        return this._endTime;
    }

    /**
     * @param {Timestamp | Date | number} endTime
     * @returns {TopicMessageQuery}
     */
    setEndTime(endTime) {
        this._endTime =
            endTime instanceof Timestamp
                ? endTime
                : endTime instanceof Date
                ? Timestamp.fromDate(endTime)
                : new Timestamp(endTime, 0);
        return this;
    }

    /**
     * @returns {?Long}
     */
    get limit() {
        return this._limit;
    }

    /**
     * @param {Long | number} limit
     * @returns {TopicMessageQuery}
     */
    setLimit(limit) {
        this._limit = limit instanceof Long ? limit : Long.fromValue(limit);

        return this;
    }

    /**
     * @param {Client<*>} client
     * @param {(message: TopicMessage) => void} listener
     * @returns {SubscriptionHandle}
     */
    subscribe(client, listener) {
        const handle = new SubscriptionHandle();

        this._makeServerStreamRequest(handle, 0, client, listener);

        return handle;
    }

    /**
     * @param {SubscriptionHandle} handle
     * @param {number} attempt
     * @param {import("../client/Client.js").default<Channel, MirrorChannel>} client
     * @param {(message: TopicMessage) => void} listener
     * @returns {void}
     */
    _makeServerStreamRequest(handle, attempt, client, listener) {
        /** @type {Map<string, proto.ConsensusTopicResponse[]>} */

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const list = new Map();

        const request = proto.ConsensusTopicQuery.encode({
            topicID: this._topicId != null ? this._topicId._toProtobuf() : null,
            consensusStartTime:
                this._startTime != null ? this._startTime._toProtobuf() : null,
            consensusEndTime:
                this._endTime != null ? this._endTime._toProtobuf() : null,
            limit: this._limit != null ? this._limit : null,
        }).finish();

        const cancel = client._mirrorNetwork
            .getNextMirrorNode()
            .channel.makeServerStreamRequest(request, (error, data) => {
                if (data == null || error != null) {
                    // NOT_FOUND or UNAVAILABLE
                    if (attempt < 10 && (error === 5 || error === 14)) {
                        setTimeout(() => {
                            this._makeServerStreamRequest(
                                handle,
                                attempt + 1,
                                client,
                                listener
                            );
                        }, 250 * 2 ** attempt);
                    }
                    return;
                }

                const message = proto.ConsensusTopicResponse.decode(data);

                if (message.chunkInfo == null) {
                    listener(TopicMessage._ofSingle(message));
                } else {
                    const chunkInfo = /** @type {proto.IConsensusMessageChunkInfo} */ (message.chunkInfo);
                    const initialTransactionID = /** @type {proto.ITransactionID} */ (chunkInfo.initialTransactionID);
                    const total = /** @type {number} */ (chunkInfo.total);
                    const transactionId = TransactionId._fromProtobuf(
                        initialTransactionID
                    ).toString();

                    /** @type {proto.ConsensusTopicResponse[]} */
                    let responses = [];

                    const temp = list.get(transactionId);
                    if (temp == null) {
                        list.set(transactionId, responses);
                    } else {
                        responses = temp;
                    }

                    responses.push(message);

                    if (responses.length === total) {
                        list.delete(transactionId);
                        listener(TopicMessage._ofMany(responses));
                    }
                }
            });

        handle._setCall(() => cancel());
    }
}
