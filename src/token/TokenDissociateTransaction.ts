import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenDissociateTransactionBody } from "../generated/TokenDissociate_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Dissociates the provided account with the provided tokens. Must be signed by the provided Account's key.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
 * If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF.
 * If any of the provided tokens has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
 * If an association between the provided account and any of the tokens does not exist, the transaction will resolve to
 * TOKEN_NOT_DISSOCIATED_TO_ACCOUNT.
 * If the provided account has a nonzero balance with any of the provided tokens, the transaction will resolve to
 * TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES.
 * On success, associations between the provided account and tokens are removed.
 */
export class TokenDissociateTransaction extends SingleTransactionBuilder {
    private _body: TokenDissociateTransactionBody;

    public constructor() {
        super();

        this._body = new TokenDissociateTransactionBody();
        this._inner.setTokendissociate(this._body);
    }

    /**
     * The account to be dissociated with the provided tokens
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    /**
     * The tokens to be dissociated with the provided account
     */
    public setTokenIds(...ids: TokenIdLike[]): this {
        this._body.setTokensList(ids.map((id) => new TokenId(id)._toProto()));
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.dissociateTokens;
    }

    protected _doValidate(_: string[]): void {}
}
