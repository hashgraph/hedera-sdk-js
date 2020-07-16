import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusSubmitMessageTransactionBody, ConsensusMessageChunkInfo } from "../generated/ConsensusSubmitMessage_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { ConsensusTopicId, ConsensusTopicIdLike } from "./ConsensusTopicId";
import * as utf8 from "@stablelib/utf8";
import { ChunkInfo } from "./ConsensusMessageSubmitTransaction";

export class SingleConsensusMessageSubmitTransaction extends SingleTransactionBuilder {
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

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return ConsensusService.submitMessage;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(_: string[]): void {
        // No local validation needed
    }
}

