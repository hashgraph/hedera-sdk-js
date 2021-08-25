import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/transaction_pb";
import { TransactionResponse } from "../generated/transaction_response_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenBurnTransactionBody } from "../generated/token_burn_pb";
import { TokenService } from "../generated/token_service_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import BigNumber from "bignumber.js";

/**
 * Burns tokens from the Token's treasury Account. If no Supply Key is defined, the transaction will resolve to
 * TOKEN_HAS_NO_SUPPLY_KEY. The operation decreases the Total Supply of the Token. Total supply cannot go below zero.
 * The amount provided must be in the lowest denomination possible. Example:
 * Token A has 2 decimals. In order to burn 100 tokens, one must provide amount of 10000. In order to burn 100.55
 * tokens, one must provide amount of 10055.
 */
export class TokenBurnTransaction extends SingleTransactionBuilder {
    private _body: TokenBurnTransactionBody;

    public constructor() {
        super();

        this._body = new TokenBurnTransactionBody();
        this._inner.setTokenburn(this._body);
    }

    /**
     * The token for which to burn tokens. If token does not exist, transaction results in INVALID_TOKEN_ID
     */
    public setTokenId(id: TokenIdLike): this {
        this._body.setToken(new TokenId(id)._toProto());
        return this;
    }

    /**
     * The amount to burn from the Treasury Account. Amount must be a positive non-zero number, not bigger than the
     * token balance of the treasury account (0; balance], represented in the lowest denomination.
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
        return TokenService.burnToken;
    }

    protected _doValidate(_: string[]): void {}
}
