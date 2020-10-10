import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenUnfreezeAccountTransactionBody } from "../generated/TokenUnfreezeAccount_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 *Unfreezes transfers of the specified token for the account. Must be signed by the Token's freezeKey.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
 * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
 * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
 * If an Association between the provided token and account is not found, the transaction will
 * resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
 * If no Freeze Key is defined, the transaction will resolve to TOKEN_HAS_NO_FREEZE_KEY.
 * Once executed the Account is marked as Unfrozen and will be able to receive or send tokens.
 * The operation is idempotent.
 */
export class TokenUnfreezeTransaction extends SingleTransactionBuilder {
    private _body: TokenUnfreezeAccountTransactionBody;

    public constructor() {
        super();

        this._body = new TokenUnfreezeAccountTransactionBody();
        this._inner.setTokenunfreeze(this._body);
    }

    /**
     * The token for which this account will be unfrozen. If token does not exist, transaction results in INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * // The account to be unfrozen
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    protected get method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.unfreezeTokenAccount;
    }

    protected _doValidate(_: string[]): void {}
}
