import { ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { ConsensusTopicId } from "./ConsensusTopicId";
import { Time } from "../Time";
import * as utf8 from "@stablelib/utf8";
import { ChunkInfo } from "./ConsensusMessageSubmitTransaction";
import { TransactionId } from "../TransactionId";

export class ConsensusMessage {
    public readonly topicId: ConsensusTopicId;
    public readonly consensusTimestamp: Time;
    public readonly message: Uint8Array;
    public readonly runningHash: Uint8Array;
    public readonly sequenceNumber: number;
    public readonly chunkInfo?: ChunkInfo;

    public constructor(topicId: ConsensusTopicId, resp: ConsensusTopicResponse) {
        this.topicId = topicId;
        this.consensusTimestamp = Time._fromProto(resp.getConsensustimestamp()!);
        this.message = resp.getMessage_asU8()!;
        this.runningHash = resp.getRunninghash_asU8();
        this.sequenceNumber = resp.getSequencenumber();

        if (resp.hasChunkinfo()) {
            const info = resp.getChunkinfo()!;
            const id = TransactionId._fromProto(info.getInitialtransactionid()!);
            const total = info.getTotal();
            const number = info.getNumber();

            this.chunkInfo = { id, total, number };
        }
    }

    public toString(): string {
        return utf8.decode(this.message);
    }
}
