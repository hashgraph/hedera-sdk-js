import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenGrantKycTransactionBody } from "../generated/TokenGrantKyc_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Grants KYC to the account for the given token. Must be signed by the Token's kycKey.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
 * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
 * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
 * If an Association between the provided token and account is not found, the transaction will resolve to
 * TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
 * If no KYC Key is defined, the transaction will resolve to TOKEN_HAS_NO_KYC_KEY.
 * Once executed the Account is marked as KYC Granted.
 */
export class TokenGrantKycTransaction extends SingleTransactionBuilder {
    private _body: TokenGrantKycTransactionBody;

    public constructor() {
        super();

        this._body = new TokenGrantKycTransactionBody();
        this._inner.setTokengrantkyc(this._body);
    }

    /**
     * The token for which this account will be granted KYC. If token does not exist, transaction results in
     * INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The account to be KYCed
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.grantKycToTokenAccount;
    }

    protected _doValidate(_: string[]): void {}
}
