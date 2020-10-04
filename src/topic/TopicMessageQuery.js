import TopicId from "./TopicId";
import SubscriptionHandle from "./SubscriptionHandle";
import TopicMessage from "./TopicMessage";
import Client from "../client/Client";
import * as proto from "@hashgraph/proto";
import Timestamp from "../Timestamp";
import Long from "long";

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
        this._limit = limit instanceof Long ? limit : Long.fromValue(limit);
        return this;
    }

    /**
     * @returns {proto.IConsensusTopicQuery}
     */
    _toProtobuf() {
        return {
            topicID: this._topicId != null ? this._topicId._toProtobuf() : null,
            consensusStartTime:
                this._startTime != null ? this._startTime._toProtobuf() : null,
            consensusEndTime:
                this._endTime != null ? this._endTime._toProtobuf() : null,
            limit: this._limit != null ? this._limit : null,
        };
    }

    /**
     * @template ChannelT
     * @param {Client<ChannelT>} client
     * @param {(message: TopicMessage) => void} onNext
     * @returns {SubscriptionHandle}
     */
    subscribe(client, onNext) {
        // const handle = new SubscriptionHandle();

        throw new Error("unimplemented");

        // makeStreamingCall(client, handle, this._toProtobuf(), onNext, 0);

        // return handle;
    }
}

// /**
//  * @template ChannelT
//  * @param {Client<ChannelT>} client
//  * @param {SubscriptionHandle} handle
//  * @param {proto.IConsensusTopicQuery} query
//  * @param {(message: TopicMessage) => void} onNext
//  * @param {number} attempt
//  * @returns {void}
//  */
// function makeStreamingCall(client, handle, query, onNext, attempt) {
//     if (attempt > 10) {
//         throw new Error("Failed to connect to mirror node");
//     }
//
//     /**
//      * @type { Map<string, proto.ConsensusTopicResponse[]>}
//      */
//     const list = new Map();
//
//     void client
//         ._getMirrorChannel(client._getNextMirrorAddress())
//         .then((channel) => {
//             channel.mirror(handle).subscribeTopic(query, (error, response) => {
//                 if (error != null) {
//                     if (attempt > 10) {
//                         throw error;
//                     }
//
//                     // If the error is `grpc.status.NOT_FOUND` (5) or `grpc.status.UNAVAILABLE` (14)
//                     // we need to try and make the connection again
//                     if (error.message === "5" || error.message === "14") {
//                         setTimeout(() => {
//                             makeStreamingCall(
//                                 client,
//                                 handle,
//                                 query,
//                                 onNext,
//                                 attempt + 1
//                             );
//                         }, 250 * Math.pow(2, attempt));
//                     }
//
//                     return;
//                 }
//
//                 if (response != null && response.chunkInfo == null) {
//                     onNext(
//                         TopicMessage._ofSingle(
//                             /** @type {proto.IConsensusTopicResponse} */ (response)
//                         )
//                     );
//                 } else if (response != null && response.chunkInfo != null) {
//                     const txId = TransactionId._fromProtobuf(
//                         /** @type {proto.TransactionID} */ (response.chunkInfo
//                             .initialTransactionID)
//                     ).toString();
//
//                     if (list.get(txId) == null) {
//                         list.set(txId, []);
//                     }
//
//                     const messages = /** @type {proto.ConsensusTopicResponse[]} */ (list.get(
//                         txId
//                     ));
//
//                     messages.push(response);
//
//                     if (
//                         messages.length ===
//                         /** @type {number} */ (response.chunkInfo.total)
//                     ) {
//                         const m = messages;
//                         list.delete(txId);
//                         onNext(TopicMessage._ofMany(m));
//                     }
//                 }
//             });
//         });
// }
