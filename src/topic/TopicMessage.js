import Time from "../Time";
import TopicMessageChunk from "./TopicMessageChunk";
import proto from "@hashgraph/proto";
import Long from "long";

export default class TopicMessage {
    /**
     * @private
     * @param {object} properties
     * @param {Time} properties.consensusTimestamp
     * @param {Uint8Array} properties.contents
     * @param {Uint8Array} properties.runningHash
     * @param {Long} properties.sequenceNumber
     * @param {TopicMessageChunk[]} properties.chunks
     */
    constructor(properties) {
        this.consensusTimestamp = properties.consensusTimestamp;
        this.contents = properties.contents;
        this.runningHash = properties.runningHash;
        this.sequenceNumber = properties.sequenceNumber;
        this.chunks = properties.chunks;
    }

    /**
     * @param {proto.IConsensusTopicResponse} response
     * @returns {TopicMessage}
     */
    static _ofSingle(response) {
        return new TopicMessage({
            // @ts-ignore
            consensusTimestamp: Time._fromProtobuf(response.consensusTimestamp),
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
         * @type {Time}
         */
        // @ts-ignore
        const consensusTimestamp = Time._fromProtobuf(last.consensusTimestamp);

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
