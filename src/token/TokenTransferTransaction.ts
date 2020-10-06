import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TokenTransfersTransactionBody } from "../generated/TokenTransfer_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { AccountAmount, TokenTransferList } from "../generated/BasicTypes_pb";

import {
    Hbar,
    Tinybar,
    hbarCheck,
    hbarFromTinybarOrHbar,
    hbarToProto
} from "../Hbar";
import { AccountId, AccountIdLike } from "../account/AccountId";
import { TokenId, TokenIdLike } from "./TokenId";

/**
 * Transfer tokens from some accounts to other accounts. Each negative amount is withdrawn from the corresponding
 * account (a sender), and each positive one is added to the corresponding account (a receiver). All amounts must
 * have sum of zero.
 * Each amount is a number with the lowest denomination possible for a token. Example:
 * Token X has 2 decimals. Account A transfers amount of 100 tokens by providing 10000 as amount in the TransferList.
 * If Account A wants to send 100.55 tokens, he must provide 10055 as amount.
 *
 * If any sender account fails to have sufficient token balance, then the entire transaction fails and none of the
 * transfers occur, though transaction fee is still charged.
 */
export class TokenTransferTransaction extends SingleTransactionBuilder {
  private readonly _body: TokenTransfersTransactionBody;
  private _tokenIdIndexes: Map<string, number>;

  public constructor() {
      super();
      this._body = new TokenTransfersTransactionBody();
      this._tokenIdIndexes = new Map();
      this._body.setTokentransfersList([]);
      this._inner.setTokentransfers(this._body);
  }

  public addSender(
      tokenId: TokenIdLike,
      accountId: AccountIdLike,
      amount: Tinybar | Hbar
  ): this {
      const hbar = hbarFromTinybarOrHbar(amount);
      hbar[ hbarCheck ]({ allowNegative: false });

      return this.addTransfer(tokenId, accountId, hbar.negated());
  }

  public addRecipient(
      tokenId: TokenIdLike,
      accountId: AccountIdLike,
      amount: Tinybar | Hbar
  ): this {
      const hbar = hbarFromTinybarOrHbar(amount);
      hbar[ hbarCheck ]({ allowNegative: false });

      return this.addTransfer(tokenId, accountId, amount);
  }

  public addTransfer(
      tokenId: TokenIdLike,
      accountId: AccountIdLike,
      amount: Tinybar | Hbar
  ): this {
      const amountHbar = hbarFromTinybarOrHbar(amount);
      amountHbar[ hbarCheck ]({ allowNegative: true });

      const index = this._tokenIdIndexes.get(new TokenId(tokenId).toString());

      const list =
      index != null ?
          this._body.getTokentransfersList()[ index ] :
          new TokenTransferList();
      this._body.addTokentransfers(list);

      const transfers = list.getTransfersList() || [];
      list.setTransfersList(transfers);

      const acctAmt = new AccountAmount();
      acctAmt.setAccountid(new AccountId(accountId)._toProto());
      acctAmt.setAmount(amountHbar[ hbarToProto ]());

      transfers.push(acctAmt);

      return this;
  }

  protected _doValidate(_: string[]): void {}

  protected get _method(): grpc.UnaryMethodDefinition<
    Transaction,
    TransactionResponse
    > {
      return TokenService.transferTokens;
  }
}
