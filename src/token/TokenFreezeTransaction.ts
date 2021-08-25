import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenFreezeAccountTransactionBody } from "../generated/token_freeze_account_pb";
import { TokenService } from "../generated/token_service_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Freezes transfers of the specified token for the account. Must be signed by the Token's freezeKey.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
 * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
 * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
 * If an Association between the provided token and account is not found, the transaction will resolve to
 * TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
 * If no Freeze Key is defined, the transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
 * Once executed the Account is marked as Frozen and will not be able to receive or send tokens unless unfrozen.
 * The operation is idempotent.
 */
export class TokenFreezeTransaction extends SingleTransactionBuilder {
    private _body: TokenFreezeAccountTransactionBody;

    public constructor() {
        super();

        this._body = new TokenFreezeAccountTransactionBody();
        this._inner.setTokenfreeze(this._body);
    }

    /**
     * The token for which this account will be frozen. If token does not exist, transaction results in INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The account to be frozen
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.freezeTokenAccount;
    }

    protected _doValidate(_: string[]): void {}
}
