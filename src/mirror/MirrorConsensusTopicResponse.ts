import { ConsensusTopicResponse } from "../generated/MirrorConsensusService_pb";
import { Time } from "../Time";
import * as utf8 from "@stablelib/utf8";

export class ConsensusMessageChunk {
    public readonly consensusTimestamp: Time;
    public readonly runningHash: Uint8Array;
    public readonly sequenceNumber: number;
    public readonly contentSize: number;

    public constructor(
        consensusTimestamp: Time,
        runningHash: Uint8Array,
        sequenceNumber: number,
        contentSize: number
    ) {
        this.consensusTimestamp = consensusTimestamp;
        this.runningHash = runningHash;
        this.sequenceNumber = sequenceNumber;
        this.contentSize = contentSize;
    }
}

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

    public readonly chunks: ConsensusMessageChunk[] | null = null;

    public constructor(message: ConsensusTopicResponse[]);
    public constructor(message: ConsensusTopicResponse);
    public constructor(maybeChunkedMessage: ConsensusTopicResponse | ConsensusTopicResponse[]) {
        if (Array.isArray(maybeChunkedMessage)) {
            const message = maybeChunkedMessage as ConsensusTopicResponse[];
            const length = message.length;

            this.consensusTimestamp =
                Time._fromProto(message[ length - 1 ].getConsensustimestamp()!);

            this.message = new Uint8Array();
            this.runningHash = message[ length - 1 ].getRunninghash_asU8();
            this.sequenceNumber = message[ length - 1 ].getSequencenumber();

            // eslint-disable-next-line max-len
            message.sort((a, b) => a.getChunkinfo()!.getNumber() < b.getChunkinfo()!.getNumber() ? -1 : 1);

            this.chunks = message.map((m) => new ConsensusMessageChunk(
                Time._fromProto(m.getConsensustimestamp()!),
                m.getRunninghash_asU8(),
                m.getSequencenumber(),
                m.getMessage_asU8().length
            ));

            // eslint-disable-next-line max-len
            const size = this.chunks.map((chunk) => chunk.contentSize).reduce((sum, current) => sum + current, 0);

            this.message = new Uint8Array(size);
            let offset = 0;

            message.forEach((message) => {
                this.message!.set(message.getMessage_asU8(), offset);
                offset += message.getMessage_asU8().length;
            });
        } else {
            const message = maybeChunkedMessage as ConsensusTopicResponse;
            this.consensusTimestamp = Time._fromProto(message.getConsensustimestamp()!);
            this.message = message.getMessage_asU8()!;
            this.runningHash = message.getRunninghash_asU8();
            this.sequenceNumber = message.getSequencenumber();
        }
    }

    public toString(): string {
        return utf8.decode(this.message);
    }
}
