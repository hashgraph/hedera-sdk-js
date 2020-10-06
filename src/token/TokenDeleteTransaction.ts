import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenDeleteTransactionBody } from "../generated/TokenDelete_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { TokenId, TokenIdLike } from "./TokenId";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Marks a token as deleted, though it will remain in the ledger.
 * The operation must be signed by the specified Admin Key of the Token. If admin key is not set, Transaction will
 * result in TOKEN_IS_IMMUTABlE. Once deleted update, mint, burn, wipe, freeze, unfreeze, grant kyc, revoke kyc and
 * token transfer transactions will resolve to TOKEN_WAS_DELETED.
 */
export class TokenDeleteTransaction extends SingleTransactionBuilder {
  private _body: TokenDeleteTransactionBody;

  public constructor() {
      super();

      this._body = new TokenDeleteTransactionBody();
      this._inner.setTokendeletion(this._body);
  }

  /**
   * The token to be deleted. If invalid token is specified, transaction will result in INVALID_TOKEN_ID
   */
  public setTokenId(id: TokenIdLike): this {
      this._body.setToken(new TokenId(id)._toProto());
      return this;
  }

  protected get method(): UnaryMethodDefinition<
    Transaction,
    TransactionResponse
    > {
      return TokenService.deleteToken;
  }

  protected _doValidate(_: string[]): void {}
}
