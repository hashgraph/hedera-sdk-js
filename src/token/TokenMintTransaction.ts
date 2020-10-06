import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenMintTransactionBody } from "../generated/TokenMint_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import BigNumber from "bignumber.js";

/**
 * Mints tokens to the Token's treasury Account. If no Supply Key is defined, the transaction will resolve to
 * TOKEN_HAS_NO_SUPPLY_KEY. The operation increases the Total Supply of the Token. The maximum total supply a token
 * can have is 2^63-1. The amount provided must be in the lowest denomination possible. Example:
 * Token A has 2 decimals. In order to mint 100 tokens, one must provide amount of 10000. In order to mint 100.55
 * tokens, one must provide amount of 10055.
 */
export class TokenMintTransaction extends SingleTransactionBuilder {
  private _body: TokenMintTransactionBody;

  public constructor() {
      super();

      this._body = new TokenMintTransactionBody();
      this._inner.setTokenmint(this._body);
  }

  /**
   * The token for which to mint tokens. If token does not exist, transaction results in INVALID_TOKEN_ID
   */
  public setTokenId(id: TokenIdLike): this {
      this._body.setToken(new TokenId(id)._toProto());
      return this;
  }

  /**
   * The amount to mint to the Treasury Account. Amount must be a positive non-zero number represented in the lowest
   * denomination of the token. The new supply must be lower than 2^63.
   */
  public setAmount(amount: BigNumber): this {
      this._body.setAmount(amount.toString());
      return this;
  }

  protected get method(): UnaryMethodDefinition<
    Transaction,
    TransactionResponse
    > {
      return TokenService.mintToken;
  }

  protected _doValidate(_: string[]): void {}
}
