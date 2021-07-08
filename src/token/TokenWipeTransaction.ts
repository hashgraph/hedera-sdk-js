import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenWipeAccountTransactionBody } from "../generated/TokenWipeAccount_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import BigNumber from "bignumber.js";

//
// Wipes the provided amount of tokens from the specified Account. Must be signed by the Token's
// Wipe key.
// If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.
// If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.
// If the provided token is not found, the transaction will resolve to INVALID_TOKEN_ID.
// If the provided token has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.
// If an Association between the provided token and account is not found, the transaction will
// resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT.
// If Wipe Key is not present in the Token, transaction results in TOKEN_HAS_NO_WIPE_KEY.
// If the provided account is the Token's Treasury Account, transaction results in CANNOT_WIPE_TOKEN_TREASURY_ACCOUNT
// On success, tokens are removed from the account and the total supply of the token is decreased by the wiped amount.
//
// The amount provided is in the lowest denomination possible. Example:
// Token A has 2 decimals. In order to wipe 100 tokens from account, one must provide amount of 10000. In order to wipe 100.55 tokens, one must provide amount of 10055.
//
export class TokenWipeTransaction extends SingleTransactionBuilder {
    private _body: TokenWipeAccountTransactionBody;

    public constructor() {
        super();

        this._body = new TokenWipeAccountTransactionBody();
        this._inner.setTokenwipe(this._body);
    }

    /**
     * The token for which the account will be wiped. If token does not exist, transaction results in INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The account to be wiped
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccount(new AccountId(id)._toProto());
        return this;
    }

    /**
     * The amount of tokens to wipe from the specified account. Amount must be a positive non-zero number in the lowest
     * denomination possible, not bigger than the token balance of the account (0; balance]
     */
    public setAmount(amount: BigNumber | number): this {
        this._body.setAmount((amount instanceof BigNumber ?
            amount :
            new BigNumber(amount)).toString());
        return this;
    }

    public addSerial(serial: BigNumber): this {
        this._body.addSerialnumbers(serial.toString());
        return this;
    }

    public setSerials(serials: BigNumber[]): this {
        this._body.setSerialnumbersList(serials.map((serial) => serial.toString()));
        return this;
    }

    protected get _method(): UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return TokenService.wipeTokenAccount;
    }

    protected _doValidate(_: string[]): void {}
}
