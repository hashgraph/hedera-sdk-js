import { ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { Time } from "../Time";
import * as utf8 from "@stablelib/utf8";

export class MirrorConsensusTopicResponse {
    /**
     * The time at which the transaction reached consensus
     */
    public readonly consensusTimestamp: Time;

    /**
     * The message body originally in the ConsensusSubmitMessageTransactionBody.
     *  Message size will be less than 4K.
     */
    public readonly message: Uint8Array;

    /**
     * The running hash (SHA384) of every message.
     */
    public readonly runningHash: Uint8Array;

    /**
     * Starts at 1 for first submitted message. Incremented on each submitted message.
     */
    public readonly sequenceNumber: number;

    public constructor(resp: ConsensusTopicResponse) {
        this.consensusTimestamp = Time._fromProto(resp.getConsensustimestamp()!);
        this.message = resp.getMessage_asU8()!;
        this.runningHash = resp.getRunninghash_asU8();
        this.sequenceNumber = resp.getSequencenumber();
    }

    public toString(): string {
        return utf8.decode(this.message);
    }
}
