import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusCreateTopicTransactionBody } from "../generated/ConsensusCreateTopic_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { PublicKey } from "../crypto/PublicKey";
import { Time } from "../Time";
import { newDuration } from "../util";
import { AccountId, AccountIdLike } from "../account/AccountId";

export class ConsensusTopicCreateTransaction extends TransactionBuilder {
    private _body: ConsensusCreateTopicTransactionBody;

    public constructor() {
        super();
        const body = new ConsensusCreateTopicTransactionBody();
        this._body = body;
        this._inner.setConsensuscreatetopic(body);
    }

    public setAdminKey(key: PublicKey): this {
        this._body.setAdminkey(key._toProtoKey());
        return this;
    }

    public setSubmitKey(key: PublicKey): this {
        this._body.setSubmitkey(key._toProtoKey());
        return this;
    }

    public setValidStart(time: Time): this {
        this._body.setValidstarttime(time._toProto());
        return this;
    }

    public setExpirationTime(time: Time): this {
        this._body.setExpirationtime(time._toProto());
        return this;
    }

    public setTopicMemo(memo: string): this {
        this._body.setMemo(memo);
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setAutoRenewAccount(id: AccountIdLike): this {
        this._body.setAutorenewaccount(new AccountId(id)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return ConsensusService.createTopic;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected _doValidate(_: string[]): void {
        // No local validation needed
    }
}
