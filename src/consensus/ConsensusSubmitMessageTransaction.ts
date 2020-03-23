import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusSubmitMessageTransactionBody } from "../generated/ConsensusSubmitMessage_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { ConsensusTopicId, ConsensusTopicIdLike } from "./ConsensusTopicId";
import * as utf8 from "@stablelib/utf8";

/** @deprecated use `ConsensusMessageSubmitTransaction` instead. */
export class ConsensusSubmitMessageTransaction extends TransactionBuilder {
    private _body: ConsensusSubmitMessageTransactionBody;

    /** @deprecated use `ConsensusMessageSubmitTransaction` instead. */
    public constructor() {
        super();

        console.warn("deprecated: ConsensusSubmitMessageTransaction has been renamed to ConsensusMessageSubmitTransaction");

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

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return ConsensusService.submitMessage;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(_: string[]): void {
        // No local validation needed
    }
}
