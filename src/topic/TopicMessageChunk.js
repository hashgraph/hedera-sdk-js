import Time from "../Time";
import proto from "@hashgraph/proto";
import Long from "long";

export default class TopicMessageChunk {
    /**
     * @private
     * @param {object} properties
     * @param {Time} properties.consensusTimestamp
     * @param {Uint8Array} properties.contents
     * @param {Uint8Array} properties.runningHash
     * @param {Long} properties.sequenceNumber
     */
    constructor(properties) {
        this.consensusTimestamp = properties.consensusTimestamp;
        this.contents = properties.contents;
        this.runningHash = properties.runningHash;
        this.sequenceNumber = properties.sequenceNumber;
    }

    /**
     * @param {proto.IConsensusTopicResponse} response
     * @returns {TopicMessageChunk}
     */
    static _fromProtobuf(response) {
        return new TopicMessageChunk({
            // @ts-ignore
            consensusTimestamp: Time._fromProtobuf(response.consensusTimestamp),
            // @ts-ignore
            contents: response.message,
            // @ts-ignore
            runningHash: response.runningHash,
            // @ts-ignore
            sequenceNumber:
                response.sequenceNumber != null
                    ? response.sequenceNumber instanceof Long
                        ? response.sequenceNumber
                        : Long.fromValue(response.sequenceNumber)
                    : Long.ZERO,
        });
    }
}
