import Timestamp from "../Timestamp";
import proto from "@hashgraph/proto";
import Long from "long";

export default class TopicMessageChunk {
    /**
     * @private
     * @param {object} properties
     * @param {Timestamp} properties.consensusTimestamp
     * @param {Uint8Array} properties.contents
     * @param {Uint8Array} properties.runningHash
     * @param {Long} properties.sequenceNumber
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

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IConsensusTopicResponse} response
     * @returns {TopicMessageChunk}
     */
    static _fromProtobuf(response) {
        return new TopicMessageChunk({
            consensusTimestamp: Timestamp._fromProtobuf(
                // @ts-ignore
                response.consensusTimestamp
            ),
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

    /**
     * @internal
     * @returns {proto.IConsensusTopicResponse}
     */
    _toProtobuf() {
        return {
            consensusTimestamp: this.consensusTimestamp._toProtobuf(),
            message: this.contents,
            runningHash: this.runningHash,
            sequenceNumber: this.sequenceNumber,
        };
    }
}
