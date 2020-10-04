import Timestamp from "../Timestamp";
import TopicMessageChunk from "./TopicMessageChunk";
import * as proto from "@hashgraph/proto";
import Long from "long";

export default class TopicMessage {
    /**
     * @private
     * @param {object} properties
     * @param {Timestamp} properties.consensusTimestamp
     * @param {Uint8Array} properties.contents
     * @param {Uint8Array} properties.runningHash
     * @param {Long} properties.sequenceNumber
     * @param {TopicMessageChunk[]} properties.chunks
     */
    constructor(properties) {
        /** @readonly */
        this.consensusTimestamp = properties.consensusTimestamp;
        /** @readonly */
        this.contents = properties.contents;
        /** @readonly */
        this.runningHash = properties.runningHash;
        /** @readonly */
        this.sequenceNumber = properties.sequenceNumber;
        /** @readonly */
        this.chunks = properties.chunks;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IConsensusTopicResponse} response
     * @returns {TopicMessage}
     */
    static _ofSingle(response) {
        return new TopicMessage({
            consensusTimestamp: Timestamp._fromProtobuf(
                /** @type {proto.ITimestamp} */
                (response.consensusTimestamp)
            ),
            contents:
                response.message != null ? response.message : new Uint8Array(),
            runningHash:
                response.runningHash != null
                    ? response.runningHash
                    : new Uint8Array(),
            sequenceNumber:
                response.sequenceNumber != null
                    ? response.sequenceNumber instanceof Long
                        ? response.sequenceNumber
                        : Long.fromNumber(response.sequenceNumber)
                    : Long.ZERO,
            chunks: [TopicMessageChunk._fromProtobuf(response)],
        });
    }

    /**
     * @internal
     * @param {proto.IConsensusTopicResponse[]} responses
     * @returns {TopicMessage}
     */
    static _ofMany(responses) {
        const length = responses.length;

        const last = /** @type {proto.IConsensusTopicResponse} */ (responses[
            length - 1
        ]);

        const consensusTimestamp = Timestamp._fromProtobuf(
            /** @type {proto.ITimestamp} */
            (last.consensusTimestamp)
        );

        const runningHash = /** @type {Uint8Array} */ (last.runningHash);

        /**
         * @type {Long}
         */
        const sequenceNumber =
            last.sequenceNumber != null
                ? last.sequenceNumber instanceof Long
                    ? last.sequenceNumber
                    : Long.fromValue(last.sequenceNumber)
                : Long.ZERO;

        responses.sort((a, b) =>
            (a != null
                ? a.chunkInfo != null
                    ? a.chunkInfo.number != null
                        ? a.chunkInfo.number
                        : 0
                    : 0
                : 0) <
            (b != null
                ? b.chunkInfo != null
                    ? b.chunkInfo.number != null
                        ? b.chunkInfo.number
                        : 0
                    : 0
                : 0)
                ? -1
                : 1
        );

        /**
         * @type {TopicMessageChunk[]}
         */
        const chunks = responses.map(
            /**
             * @type {proto.IConsensusTopicResponse}
             */ (m) => TopicMessageChunk._fromProtobuf(m)
        );

        const size = chunks
            .map((chunk) => chunk.contents.length)
            .reduce((sum, current) => sum + current, 0);

        const contents = new Uint8Array(size);
        let offset = 0;

        responses.forEach((value) => {
            contents.set(/** @type {Uint8Array} */ (value.message), offset);
            offset += /** @type {Uint8Array} */ (value.message).length;
        });

        return new TopicMessage({
            consensusTimestamp,
            contents,
            runningHash,
            sequenceNumber,
            chunks,
        });
    }
}
