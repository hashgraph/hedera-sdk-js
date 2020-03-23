import { ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import * as utf8 from "@stablelib/utf8";

export class ConsensusMessage {
    public readonly topicId: ConsensusTopicId;
    public readonly consensusTimestamp: Time;
    public readonly message: Uint8Array;
    public readonly runningHash: Uint8Array;
    public readonly sequenceNumber: number;

    public constructor(topicId: ConsensusTopicId, resp: ConsensusTopicResponse) {
        this.topicId = topicId;
        this.consensusTimestamp = Time._fromProto(resp.getConsensustimestamp()!);
        this.message = resp.getMessage_asU8()!;
        this.runningHash = resp.getRunninghash_asU8();
        this.sequenceNumber = resp.getSequencenumber();
    }

    public toString(): string {
        return utf8.decode(this.message);
    }
}
