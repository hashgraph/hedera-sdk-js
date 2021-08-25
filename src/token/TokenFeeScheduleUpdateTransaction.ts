import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenFeeScheduleUpdateTransactionBody } from "../generated/token_fee_schedule_update_pb";
import { TokenService } from "../generated/token_service_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { CustomFee } from "./CustomFee";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * FeeScheduleUpdates an already created Token. If no value is given for a field, that field is left unchanged. For an immutable
 * tokens (that is, a token created without an adminKey), only the expiry may be feescheduleupdated. Setting any other field in
 * that case will cause the transaction status to resolve to TOKEN_IS_IMMUTABlE.
 */
export class TokenFeeScheduleUpdateTransaction extends SingleTransactionBuilder {
    private _body: TokenFeeScheduleUpdateTransactionBody;

    public constructor() {
        super();

        this._body = new TokenFeeScheduleUpdateTransactionBody();
        this._inner.setTokenFeeScheduleUpdate(this._body);
    }

    /**
     * The Token to be feescheduleupdated
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setTokenId(new TokenId(id)._toProto());
        return this;
    }

    public setCustomFees(customFeeList: CustomFee[]): this {
        for (const fee of customFeeList) {
            this._body.addCustomFees(fee._toProto());
        }
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.updateTokenFeeSchedule;
    }

    protected _doValidate(_: string[]): void {}
}
