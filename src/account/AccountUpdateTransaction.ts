import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoUpdateTransactionBody } from "../generated/CryptoUpdate_pb";
import { newDuration } from "../util";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { Hbar, Tinybar, hbarFromTinybarOrHbar, hbarCheck, hbarToProtoValue } from "../Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { PublicKey } from "../crypto/PublicKey";
import { AccountId, AccountIdLike } from "./AccountId";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { BoolValue } from "google-protobuf/google/protobuf/wrappers_pb";

/**
 * Change properties for the given account. Any null field is ignored (left unchanged). This
 * transaction must be signed by the existing key for this account. If the transaction is
 * changing the key field, then the transaction must be signed by both the old key
 * (from before the change) and the new key. The old key must sign for security. The new
 * key must sign as a safeguard to avoid accidentally changing to an invalid key, and then
 * having no way to recover. When extending the expiration date, the cost is affected by the
 * size of the list of attached claims, and of the keys associated with the claims and the account.
 */
export class AccountUpdateTransaction extends SingleTransactionBuilder {
    private _body: CryptoUpdateTransactionBody;

    public constructor() {
        super();
        const body = new CryptoUpdateTransactionBody();
        this._body = body;
        this._inner.setCryptoupdateaccount(body);
    }

    /**
     * The account ID which is being updated in this transaction.
     */
    public setAccountId(id: AccountIdLike): this {
        this._body.setAccountidtoupdate(new AccountId(id)._toProto());
        return this;
    }

    /**
     * The new key.
     */
    public setKey(publicKey: PublicKey): this {
        this._body.setKey(publicKey._toProtoKey());
        return this;
    }

    /**
     * The new expiration time to extend to (ignored if equal to or before the current one)
     */
    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    /**
     * The duration in which it will automatically extend the expiration period. If it doesn't
     * have enough balance, it extends as long as possible. If it is empty when it expires,
     * then it is deleted.
     */
    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    /**
     * ID of the account to which this account is proxy staked. If proxyAccountID is null, or is
     * an invalid account, or is an account that isn't a node, then this account is automatically
     * proxy staked to a node chosen by the network, but without earning payments. If the
     * proxyAccountID account refuses to accept proxy staking , or if it is not currently running
     * a node, then it will behave as if proxyAccountID was null.
     */
    public setProxyAccountId(id: AccountId): this {
        this._body.setProxyaccountid(id._toProto());
        return this;
    }

    /**
     * The new expiration time to extend to (ignored if equal to or before the current one).
     * @deprecated `.setPorxyAccount` was renamed to `.setProxyAccountId`
     */
    public setPorxyAccount(id: AccountId): this {
        console.warn("deprecated: `.setPorxyAccount` was renamed to `.setProxyAccountId`");
        return this.setProxyAccountId(id);
    }

    /**
     * The new threshold amount (in tinybars) for which an account record is created for any send/withdraw transaction.
     */
    public setReceiverSignatureRequired(required: boolean): this {
        const value = new BoolValue();
        value.setValue(required);
        this._body.setReceiversigrequiredwrapper(value);
        return this;
    }

    /**
     * The new threshold amount (in tinybars) for which an account record is created for any receive/deposit transaction.
     */
    public setReceiveRecordThreshold(threshold: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(threshold);
        hbar[ hbarCheck ]({ allowNegative: false });

        this._body.setReceiverecordthresholdwrapper(hbar[ hbarToProtoValue ]());
        return this;
    }

    /**
     * The new expiration time to extend to (ignored if equal to or before the current one).
     */
    public setSendRecordThreshold(threshold: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(threshold);
        hbar[ hbarCheck ]({ allowNegative: false });

        this._body.setSendrecordthresholdwrapper(hbar[ hbarToProtoValue ]());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.updateAccount;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasAccountidtoupdate()) {
            errors.push("AccountUpdateTransaction requires .setAccountId()");
        }
    }
}
