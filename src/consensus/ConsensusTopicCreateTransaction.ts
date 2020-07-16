import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ConsensusCreateTopicTransactionBody } from "../generated/ConsensusCreateTopic_pb";
import { ConsensusService } from "../generated/ConsensusService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { PublicKey } from "../crypto/PublicKey";
import { newDuration } from "../util";
import { AccountId, AccountIdLike } from "../account/AccountId";

export class ConsensusTopicCreateTransaction extends SingleTransactionBuilder {
    private _body: ConsensusCreateTopicTransactionBody;

    public constructor() {
        super();
        const body = new ConsensusCreateTopicTransactionBody();
        this._body = body;
        this._inner.setConsensuscreatetopic(body);
        this.setAutoRenewPeriod(7890000);
    }

    public setAdminKey(key: PublicKey): this {
        this._body.setAdminkey(key._toProtoKey());
        return this;
    }

    /**
     * @deprecated `ConsensusTopicUpdateTransaction.setAutoRenewAccount()`
     * use `ConsensusTopicUpdateTransaction.setAutoRenewAccountId()` instead.
     */
    public setAutoRenewAccount(id: AccountIdLike): this {
        console.warn("`ConsensusTopicCreateTransaction.setAutoRenewAccount()` is deprecated\
use `ConsensusTopicCreateTransaction.setAutoRenewAccountId()` instead.");
        return this.setAutoRenewAccountId(id);
    }

    public setAutoRenewAccountId(id: AccountIdLike): this {
        this._body.setAutorenewaccount(new AccountId(id)._toProto());
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setSubmitKey(key: PublicKey): this {
        this._body.setSubmitkey(key._toProtoKey());
        return this;
    }

    public setTopicMemo(memo: string): this {
        this._body.setMemo(memo);
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
