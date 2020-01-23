import { ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusTopicId } from "../consensus/ConsensusTopicId";
import { Time } from "../Time";

export class MirrorConsensusTopicResponse {
    public readonly consensusTimestamp: Time;
    public readonly message: Uint8Array;
    public readonly runningHash: Uint8Array;
    public readonly sequenceNumber: number;

    public constructor(resp: ConsensusTopicResponse) {
        this.consensusTimestamp = Time._fromProto(resp.getConsensustimestamp()!);
        this.message = resp.getMessage_asU8()!;
        this.runningHash = resp.getRunninghash_asU8();
        this.sequenceNumber = resp.getSequencenumber();
    }

    public toString(): string {
        return Buffer.from(this.message).toString("utf8");
    }
}
