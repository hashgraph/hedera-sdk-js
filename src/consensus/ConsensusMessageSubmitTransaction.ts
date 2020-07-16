import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction as ProtoTransaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusSubmitMessageTransactionBody, ConsensusMessageChunkInfo } from "../generated/ConsensusSubmitMessage_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { ConsensusTopicId, ConsensusTopicIdLike } from "./ConsensusTopicId";
import * as utf8 from "@stablelib/utf8";
import { TransactionId } from "../TransactionId";
import { BaseClient } from "../BaseClient";
import { Transaction } from "../Transaction";
import { TopicID } from "../generated/BasicTypes_pb";
import { TransactionBody } from "../generated/TransactionBody_pb";
import { hbarToProto } from "../Hbar";

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

    public constructor() {
        super();
        // const body = new ConsensusSubmitMessageTransactionBody();
        // this._body = body;
        // this._inner.setConsensussubmitmessage(body);
    }

    public setTopicId(id: ConsensusTopicIdLike): this {
        // this._body.setTopicid(new ConsensusTopicId(id)._toProto());
        this.topicId = new ConsensusTopicId(id);
        return this;
    }

    public setMessage(message: Uint8Array | string): this {
        let bytes: Uint8Array;
        if (message instanceof Uint8Array) {
            // this._body.setMessage(message as Uint8Array);
            bytes = message;
        } else {
            bytes = utf8.encode(message);
            // this._body.setMessage(utf8.encode(message as string));
        }

        if (bytes.length / ConsensusMessageSubmitTransaction.chunkSize > this.maxChunks) {
            throw new Error(`Message with size ${bytes.length} too long for ${this.maxChunks} chunks`);
        }

        this.message = bytes;

        return this;
    }

    public build(client: BaseClient): Transaction[] {
        const chunks = [];

        // split message into one or more "chunks"
        for (let i = 0; i < this.message!.length; i += ConsensusMessageSubmitTransaction.chunkSize) {
            chunks.push(this.message!.slice(i, i + ConsensusMessageSubmitTransaction.chunkSize));
        }

        const initialTransactionId = new TransactionId(client._getOperatorAccountId()!);
        const transactionBuilders: TransactionBody[] = [];
        chunks.forEach((chunk, index) => {
            const chunkInfo = new ConsensusMessageChunkInfo();
            chunkInfo.setInitialtransactionid(initialTransactionId._toProto());
            chunkInfo.setNumber(index + 1);
            chunkInfo.setTotal(chunks.length);

            const body = new ConsensusSubmitMessageTransactionBody();
                body.setTopicid(this.topicId!._toProto());
                body.setMessage(this.message!);
                body.setChunkinfo(chunkInfo);

            const inner = Object.assign(new TransactionBody(), this._inner);
            inner.setConsensussubmitmessage(body);

            ///
            if (client && this._shouldSetFee && this._inner.getTransactionfee() === "0") {
                // Don't override TransactionFee if it's already set
                inner.setTransactionfee(client._maxTransactionFee[hbarToProto]());
            }
    
            if (client && !this._inner.hasTransactionid()) {
                if (client._getOperatorAccountId()) {
                    const tx = new TransactionId(client._getOperatorAccountId()!);
                    this._inner.setTransactionid(tx._toProto());
                }
            }
    
            if (!this._inner.hasTransactionvalidduration()) {
                this.setTransactionValidDuration(maxValidDuration);
            }
    
            // Set `this._node` accordingly if client is supplied otherwise error out
            if (!this._node && !client) {
                throw new Error("`setNodeAccountId` must be called if client is not supplied");
            }
    
            if (!this._node) {
                this._node = client!._randomNode().id;
            }
    
            if (this._node && !this._inner.hasNodeaccountid()) {
                this.setNodeAccountId(this._node);
            }
    
            this.validate();
    
            const protoTx = new Transaction_();
            protoTx.setBodybytes(this._inner.serializeBinary());
    
            return Transaction[transactionCreate](this._node, protoTx, this._inner, this._method);
            ///

            transactionBuilders.push(inner);
        });

        transactionBuilders[0].setTransactionid(initialTransactionId._toProto());

        return transactionBuilders.map((t) => t.build(client));
    }

    public execute(client: BaseClient): Promise<TransactionId[]> {
        this.build(client).map(async (tx) => await tx.execute(client));
    }

    public setChunkInfo(info: ChunkInfo): this {
        const chunkInfo = new ConsensusMessageChunkInfo();
        chunkInfo.setInitialtransactionid(info.id._toProto());
        chunkInfo.setNumber(info.number);
        chunkInfo.setTotal(info.total);

        // this._body.setChunkinfo(chunkInfo);

        return this;
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
