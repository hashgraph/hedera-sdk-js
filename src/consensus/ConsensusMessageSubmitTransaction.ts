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

export interface ChunkInfo {
    // TransactionID of the first chunk, gets copied to every subsequent chunk in a fragmented message.
    id: TransactionId;

    // The total number of chunks in the message.
    number: number;

    // The sequence number (from 1 to total) of the current chunk in the message.
    total: number;
}

export class ConsensusMessageSubmitTransaction extends TransactionBuilder {
    private _body: ConsensusSubmitMessageTransactionBody;

    public constructor() {
        super();
        const body = new ConsensusSubmitMessageTransactionBody();
        this._body = body;
        this._inner.setConsensussubmitmessage(body);
    }

    public setTopicId(id: ConsensusTopicIdLike): this {
        this._body.setTopicid(new ConsensusTopicId(id)._toProto());
        return this;
    }

    public setMessage(message: Uint8Array | string): this {
        if (message instanceof Uint8Array) {
            this._body.setMessage(message as Uint8Array);
        } else {
            this._body.setMessage(utf8.encode(message as string));
        }
        return this;
    }

    public setChunkInfo(info: ChunkInfo): this {
        const chunkInfo = new ConsensusMessageChunkInfo();
        chunkInfo.setInitialtransactionid(info.id._toProto());
        chunkInfo.setNumber(info.number);
        chunkInfo.setTotal(info.total);

        this._body.setChunkinfo(chunkInfo);

        return this;
    }

    public chunks(client: BaseClient): Transaction[] {
        const chunkSize = 4096;

        const bytes = this._body.getMessage() instanceof Uint8Array ?
            this._body.getMessage_asU8() :
            utf8.encode(this._body.getMessage_asB64());
        const chunks = [];

        // split message into one or more "chunks"
        for (let i = 0; i < bytes.length; i += chunkSize) {
            chunks.push(bytes.slice(i, i + chunkSize));
        }

        const initialTransactionId = new TransactionId(client._getOperatorAccountId()!);
        const transactionBuilders: ConsensusMessageSubmitTransaction[] = [];
        chunks.forEach((chunk, index) => {
            const transaction = new ConsensusMessageSubmitTransaction()
                .setTopicId(ConsensusTopicId._fromProto(this._body.getTopicid()!))
                .setMessage(chunk)
                .setChunkInfo({
                    id: initialTransactionId,
                    number: index + 1,
                    total: chunks.length
                });

            if (this._inner.hasTransactionvalidduration()) {
                transaction._inner.setTransactionvalidduration(this._inner.getTransactionvalidduration()!);
            }

            if (this._inner.getTransactionfee().length !== 0) {
                // TODO: divide by number of chunks?
                transaction._inner.setTransactionfee(this._inner.getTransactionfee());
            }

            if (this._inner.getGeneraterecord()) {
                transaction.setGenerateRecord(true);
            }

            // TODO: the rest of the stuff

            transactionBuilders.push(transaction);
        });

        transactionBuilders[ 0 ].setTransactionId(initialTransactionId);

        return transactionBuilders.map((t) => t.build(client));
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
