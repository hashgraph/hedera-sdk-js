import Timestamp from "../Timestamp";
import TopicMessageChunk from "./TopicMessageChunk";
import proto from "@hashgraph/proto";
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
                // @ts-ignore
                response.consensusTimestamp
            ),
            // @ts-ignore
            contents: response.message,
            // @ts-ignore
            runningHash: response.runningHash,
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

        /**
         * @type {proto.IConsensusTopicResponse}
         * @ts-ignore
         */
        const last = responses[length - 1];

        /**
         * @type {Timestamp}
         */
        const consensusTimestamp = Timestamp._fromProtobuf(
            // @ts-ignore
            last.consensusTimestamp
        );

        /**
         * @type {Uint8Array}
         */
        // @ts-ignore
        const runningHash = last.runningHash;

        /**
         * @type {Long}
         */
        const sequenceNumber =
            last.sequenceNumber != null
                ? last.sequenceNumber instanceof Long
                    ? last.sequenceNumber
                    : Long.fromValue(last.sequenceNumber)
                : Long.ZERO;

        // @ts-ignore
        responses.sort((a, b) =>
            // @ts-ignore
            a.chunkInfo.number < b.chunkInfo.number ? -1 : 1
        );

        /**
         * @type {TopicMessageChunk[]}
         * @ts-ignore
         */
        const chunks = responses.map((m) => TopicMessageChunk._fromProtobuf(m));

        // @ts-ignore
        const size = chunks
            .map((chunk) => chunk.contents.length)
            .reduce((sum, current) => sum + current, 0);

        /**
         * @type {Uint8Array}
         */
        const contents = new Uint8Array(size);
        let offset = 0;

        responses.forEach((value) => {
            // @ts-ignore
            contents.set(value.message, offset);
            // @ts-ignore
            offset += value.message.length;
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
