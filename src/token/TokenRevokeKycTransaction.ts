import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenRevokeKycTransactionBody } from "../generated/token_revoke_kyc_pb";
import { TokenService } from "../generated/token_service_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Revokes KYC to the account for the given token. Must be signed by the Token's kycKey.
 * If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
 * If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
 * If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
 * If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
 * If an Association between the provided token and account is not found, the transaction will resolve to
 * TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
 * If no KYC Key is defined, the transaction will resolve to TOKEN_HAS_NO_KYC_KEY.
 * Once executed the Account is marked as KYC Revokeed.
 */
export class TokenRevokeKycTransaction extends SingleTransactionBuilder {
    private _body: TokenRevokeKycTransactionBody;

    public constructor() {
        super();

        this._body = new TokenRevokeKycTransactionBody();
        this._inner.setTokenrevokekyc(this._body);
    }

    /**
     * The token for which this account will get his KYC revoked. If token does not exist, transaction results in
     * INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The account to be KYC Revoked
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.revokeKycFromTokenAccount;
    }

    protected _doValidate(_: string[]): void {}
}
