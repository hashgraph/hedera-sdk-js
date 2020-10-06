import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { PublicKey } from "../crypto/PublicKey";
import { AccountId, AccountIdLike } from "../account/AccountId";
import { TokenCreateTransactionBody } from "../generated/TokenCreate_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { dateToTimestamp } from "../Timestamp";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

/**
 * Create a new token. After the token is created, the Token ID for it is in the receipt.
 * The specified Treasury Account is receiving the initial supply of tokens as-well as the tokens from the Token Mint
 * operation once executed. The balance of the treasury account is decreased when the Token Burn operation is executed.
 *
 * The supply that is going to be put in circulation is going to be the initial supply provided. The maximum supply a
 * token can have is 2^63-1.
 *
 * Example:
 * Token A has initial supply set to 10_000 and decimals set to 2. The tokens that will be put into circulation are
 * going be 100. Token B has initial supply set to 10_012_345_678 and decimals set to 8. The number of tokens that
 * will be put into circulation are going to be 100.12345678
 *
 * Creating immutable token: Token can be created as immutable if the adminKey is omitted. In this case, the name,
 * symbol, treasury, management keys, expiry and renew properties cannot be updated. If a token is created as immutable,
 * anyone is able to extend the expiry time by paying the fee.
 *
 * After executing, you can retrieve the token ID via
 * {@link com.hedera.hashgraph.sdk.TransactionId#getReceipt(Client)}
 * and then {@link TransactionReceipt#getTokenId()}.
 */
export class TokenCreateTransaction extends SingleTransactionBuilder {
  private _body: TokenCreateTransactionBody;

  public constructor() {
      super();

      this._body = new TokenCreateTransactionBody();
      this._inner.setTokencreation(this._body);

      this.setAutoRenewPeriod(7890000);
  }

  /**
   * Set the publicly visible name of the token, specified as a string of only ASCII characters
   *
   * @param name
   * @return TokenCreateTransaction
   */
  public setName(name: string): this {
      this._body.setName(name);
      return this;
  }

  /**
   * The publicly visible token symbol. It is UTF-8 capitalized alphabetical string identifying the token
   *
   * @param symbol
   * @return TokenCreateTransaction
   */
  public setSybmol(symbol: string): this {
      this._body.setSymbol(symbol);
      return this;
  }

  /**
   * The number of decimal places a token is divisible by. This field can never be changed!
   *
   * @param decimal
   * @return TokenCreateTransaction
   */
  public setDecimals(decimal: number): this {
      this._body.setDecimals(decimal);
      return this;
  }

  /**
   * Specifies the initial supply of tokens to be put in circulation.
   * The initial supply is sent to the Treasury Account.
   * The supply is in the lowest denomination possible.
   *
   * @param initialSupply
   * @return TokenCreateTransaction
   */
  public setInitialSupply(initialSupply: number): this {
      this._body.setInitialsupply(initialSupply);
      return this;
  }

  /**
   * The account which will act as a treasury for the token. This account will receive the specified initial supply
   *
   * @param treasury
   * @return TokenCreateTransaction
   */
  public setTreasury(treasury: AccountIdLike): this {
      this._body.setTreasury(new AccountId(treasury)._toProto());
      return this;
  }

  /**
   * The key which can perform update/delete operations on the token. If empty, the token can be perceived as
   * immutable (not being able to be updated/deleted)
   *
   * @param key
   * @return TokenCreateTransaction
   */
  public setAdminKey(key: PublicKey): this {
      this._body.setAdminkey(key._toProtoKey());
      return this;
  }

  /**
   * The key which can grant or revoke KYC of an account for the token's transactions. If empty, KYC is not required,
   * and KYC grant or revoke operations are not possible.
   *
   * @param key
   * @return TokenCreateTransaction
   */
  public setKycKey(key: PublicKey): this {
      this._body.setKyckey(key._toProtoKey());
      return this;
  }

  /**
   * The key which can sign to freeze or unfreeze an account for token transactions.
   * If empty, freezing is not possible
   *
   * @param key
   * @return TokenCreateTransaction
   */
  public setFreezeKey(key: PublicKey): this {
      this._body.setFreezekey(key._toProtoKey());
      return this;
  }

  /**
   * The key which can wipe the token balance of an account. If empty, wipe is not possible
   *
   * @param key
   * @return TokenCreateTransaction
   */
  public setWipeKey(key: PublicKey): this {
      this._body.setWipekey(key._toProtoKey());
      return this;
  }

  /**
   * The key which can change the supply of a token. The key is used to sign Token Mint/Burn operations
   *
   * @param key
   * @return TokenCreateTransaction
   */
  public setSupplyKey(key: PublicKey): this {
      this._body.setSupplykey(key._toProtoKey());
      return this;
  }

  /**
   * The default Freeze status (frozen or unfrozen) of Hedera accounts relative to this token. If true, an account
   * must be unfrozen before it can receive the token
   *
   * @param freeze
   * @return TokenCreateTransaction
   */
  public setFreezeDefault(freeze: boolean): this {
      this._body.setFreezedefault(freeze);
      return this;
  }

  /**
   * The epoch second at which the token should expire; if an auto-renew account and period are specified, this is
   * coerced to the current epoch second plus the autoRenewPeriod
   *
   * @param expirationTime
   * @return TokenCreateTransaction
   */
  public setExpirationTime(date: number | Date): this {
      this._body.setExpiry(dateToTimestamp(date).seconds);
      return this;
  }

  /**
   * An account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval
   *
   * @param account
   * @return TokenCreateTransaction
   */
  public setAutoRenewAccount(account: AccountIdLike): this {
      this._body.setAutorenewaccount(new AccountId(account)._toProto());
      return this;
  }

  /**
   * The interval at which the auto-renew account will be charged to extend the token's expiry
   *
   * @param seconds
   * @return TokenCreateTransaction
   */
  public setAutoRenewPeriod(seconds: number): this {
      this._body.setAutorenewperiod(seconds);
      return this;
  }

  protected get method(): UnaryMethodDefinition<
    Transaction,
    TransactionResponse
    > {
      return TokenService.createToken;
  }

  protected _doValidate(_: string[]): void {}
}
