import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { PublicKey } from "../crypto/PublicKey";
import { AccountId, AccountIdLike } from "../account/AccountId";
import { TokenUpdateTransactionBody } from "../generated/token_update_pb";
import { TokenService } from "../generated/token_service_pb_service";
import { timestampToProto, dateToTimestamp } from "../Timestamp";
import { TokenId, TokenIdLike } from "./TokenId";
import { newDuration } from "../util";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Updates an already created Token. If no value is given for a field, that field is left unchanged. For an immutable
 * tokens (that is, a token created without an adminKey), only the expiry may be updated. Setting any other field in
 * that case will cause the transaction status to resolve to TOKEN_IS_IMMUTABlE.
 */
export class TokenUpdateTransaction extends SingleTransactionBuilder {
    private _body: TokenUpdateTransactionBody;

    public constructor() {
        super();

        this._body = new TokenUpdateTransactionBody();
        this._inner.setTokenupdate(this._body);
    }

    /**
     * The Token to be updated
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The new Name of the Token. Must be a string of ASCII characters.
     */
    public setName(name: string): this {
        this._body.setName(name);
        return this;
    }

    /**
     * The new Symbol of the Token. Must be UTF-8 capitalized alphabetical string identifying the token.
     */
    public setSymbol(symbol: string): this {
        this._body.setSymbol(symbol);
        return this;
    }

    /**
     * The new Treasury account of the Token. If the provided treasury account is not existing or deleted, the response
     * will be INVALID_TREASURY_ACCOUNT_FOR_TOKEN. If successful, the Token balance held in the previous
     * Treasury Account is transferred to the new one.
     */
    public setTreasury(treasury: AccountIdLike): this {
        this._body.setTreasury(new AccountId(treasury)._toProto());
        return this;
    }

    /**
     * The new Admin key of the Token. If Token is immutable, transaction will resolve to TOKEN_IS_IMMUTABlE.
     */
    public setAdminKey(key: PublicKey): this {
        this._body.setAdminkey(key._toProtoKey());
        return this;
    }

    /**
     * The new KYC key of the Token. If Token does not have currently a KYC key, transaction will resolve to
     * TOKEN_HAS_NO_KYC_KEY.
     */
    public setKycKey(key: PublicKey): this {
        this._body.setKyckey(key._toProtoKey());
        return this;
    }

    /**
     * The new Freeze key of the Token. If the Token does not have currently a Freeze key, transaction will resolve to
     * TOKEN_HAS_NO_FREEZE_KEY.
     */
    public setFreezeKey(key: PublicKey): this {
        this._body.setFreezekey(key._toProtoKey());
        return this;
    }

    /**
     * The new Wipe key of the Token. If the Token does not have currently a Wipe key, transaction will resolve to
     * TOKEN_HAS_NO_WIPE_KEY.
     */
    public setWipeKey(key: PublicKey): this {
        this._body.setWipekey(key._toProtoKey());
        return this;
    }

    /**
     * The new Supply key of the Token. If the Token does not have currently a Supply key, transaction will resolve to
     * TOKEN_HAS_NO_SUPPLY_KEY.
     */
    public setSupplyKey(key: PublicKey): this {
        this._body.setSupplykey(key._toProtoKey());
        return this;
    }

    /**
     * The new expiry time of the token. Expiry can be updated even if admin key is not set. If the provided expiry is
     * earlier than the current token expiry, transaction wil resolve to INVALID_EXPIRATION_TIME
     */
    public setExpirationTime(date: number | Date): this {
        this._body.setExpiry(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    /**
     * The new account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval.
     */
    public setAutoRenewAccount(account: AccountIdLike): this {
        this._body.setAutorenewaccount(new AccountId(account)._toProto());
        return this;
    }

    /**
     * The new interval at which the auto-renew account will be charged to extend the token's expiry.
     */
    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.updateToken;
    }

    protected _doValidate(_: string[]): void {}
}
