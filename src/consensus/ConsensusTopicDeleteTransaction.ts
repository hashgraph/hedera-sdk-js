import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusDeleteTopicTransactionBody } from "../generated/consensus_delete_topic_pb";
import { ConsensusService } from "../generated/consensus_service_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { ConsensusTopicId, ConsensusTopicIdLike } from "./ConsensusTopicId";

export class ConsensusTopicDeleteTransaction extends SingleTransactionBuilder {
    private _body: ConsensusDeleteTopicTransactionBody;

    public constructor() {
        super();
        const body = new ConsensusDeleteTopicTransactionBody();
        this._body = body;
        this._inner.setConsensusdeletetopic(body);
    }

    public setTopicId(id: ConsensusTopicIdLike): this {
        this._body.setTopicid(new ConsensusTopicId(id)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return ConsensusService.deleteTopic;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(_: string[]): void {
        // No local validation needed
    }
}
