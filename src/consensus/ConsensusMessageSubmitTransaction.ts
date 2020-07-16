import { TransactionBuilder } from "../TransactionBuilder";
import { SingleConsensusMessageSubmitTransaction } from "./SingleConsensusMessageSubmitTransaction";
import { Transaction as ProtoTransaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { ConsensusTopicId, ConsensusTopicIdLike } from "./ConsensusTopicId";
import * as utf8 from "@stablelib/utf8";
import { TransactionId } from "../TransactionId";
import { BaseClient } from "../BaseClient";
import { Transaction } from "../Transaction";
import {Hbar} from "../Hbar";

export interface ChunkInfo {
    // TransactionID of the first chunk, gets copied to every subsequent chunk in a fragmented message.
    id: TransactionId;

    // The total number of chunks in the message.
    number: number;

    // The sequence number (from 1 to total) of the current chunk in the message.
    total: number;
}

export class ConsensusMessageSubmitTransaction extends TransactionBuilder<Transaction[]> {
    private static readonly chunkSize = 4096;
    private maxChunks = 10;
    private topicId: ConsensusTopicId | null = null;
    private message: Uint8Array | null = null;
    private chunkInfo: ChunkInfo | null = null;

    public constructor() {
        super();
    }

    public setTopicId(id: ConsensusTopicIdLike): this {
        this.topicId = new ConsensusTopicId(id);
        return this;
    }

    public setMessage(message: Uint8Array | string): this {
        this.message = message instanceof Uint8Array ? message : utf8.encode(message);
        return this;
    }

    public setChunkInfo(info: ChunkInfo): this {
        this.chunkInfo = info
        return this;
    }

    public build(client: BaseClient): Transaction[] {
        if (this.message!.length / ConsensusMessageSubmitTransaction.chunkSize > this.maxChunks) {
            throw new Error(`Message with size ${this.message!.length} too long for ${this.maxChunks} chunks`);
        }

        const initialTransactionId = this._inner.getTransactionid() == null
            ? new TransactionId(client._getOperatorAccountId()!)
            : TransactionId._fromProto(this._inner.getTransactionid()!);
        
        let time = initialTransactionId.validStart;

        if (this.chunkInfo != null) {
            return [new SingleConsensusMessageSubmitTransaction()
                .setTopicId(this.topicId!)
                .setMessage(this.message!)
                .setChunkInfo(this.chunkInfo!)
                .build(client)
            ];
        }

        const chunks = [];

        // split message into one or more "chunks"
        for (let i = 0; i < this.message!.length; i += ConsensusMessageSubmitTransaction.chunkSize) {
            chunks.push(this.message!.slice(i, i + ConsensusMessageSubmitTransaction.chunkSize));
        }

        return chunks.map((chunk, index) => {
            const tx = new SingleConsensusMessageSubmitTransaction()
                .setTopicId(this.topicId!)
                .setMessage(chunk)
                .setChunkInfo({
                    id: initialTransactionId,
                    total: chunks.length,
                    number: index + 1,
                })
                .setTransactionId(TransactionId.withValidStart(initialTransactionId.accountId, time))
                .build(client);

            time = time._increment();

            return tx;
        });
    }

    public async getCost(_: BaseClient): Promise<Hbar> {
        throw new Error("Cannot get cost of a transaction list");
    }

    public async execute(client: BaseClient): Promise<TransactionId[]> {
        const ids: TransactionId[] = [];
        this.build(client).forEach(async (tx) => ids.push(await tx.execute(client)));
        return ids;
    }

    protected get _method(): UnaryMethodDefinition<ProtoTransaction, TransactionResponse> {
        return ConsensusService.submitMessage;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(_: string[]): void {
        // No local validation needed
    }
}
