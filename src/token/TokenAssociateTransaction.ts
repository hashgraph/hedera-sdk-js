import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenAssociateTransactionBody } from "../generated/TokenAssociate_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Associates the provided account with the provided tokens. Must be signed by the provided Account's key.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been associated, the transaction will resolve to ACCOUNT_ASSOCIATED.
 * If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF.
 * If any of the provided tokens has been associated, the transaction will resolve to TOKEN_WAS_ASSOCIATED.
 * If an association between the provided account and any of the tokens already exists, the transaction will resolve to
 * TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT.
 * If the provided account's associations count exceed the constraint of maximum token associations per account, the
 * transaction will resolve to TOKENS_PER_ACCOUNT_LIMIT_EXCEEDED.
 * On success, associations between the provided account and tokens are made and the account is ready to interact with
 * the tokens.
 */
export class TokenAssociateTransaction extends SingleTransactionBuilder {
    private _body: TokenAssociateTransactionBody;

    public constructor() {
        super();

        this._body = new TokenAssociateTransactionBody();
        this._inner.setTokenassociate(this._body);
    }

    /**
     * The account to be associated with the provided tokens
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    /**
     * The tokens to be associated with the provided account
     */
    public setTokenIds(...ids: TokenIdLike[]): this {
        this._body.setTokensList(ids.map((id) => new TokenId(id)._toProto()));
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.associateTokens;
    }

    protected _doValidate(_: string[]): void {}
}
