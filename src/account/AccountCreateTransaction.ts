import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoCreateTransactionBody } from "../generated/CryptoCreate_pb";
import { newDuration } from "../util";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { Hbar, Tinybar } from "../Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import BigNumber from "bignumber.js";
import { PublicKey } from "../crypto/PublicKey";
import { AccountId, AccountIdLike } from "./AccountId";

export class AccountCreateTransaction extends TransactionBuilder {
    private _body: CryptoCreateTransactionBody;

    public constructor() {
        super();
        const body = new CryptoCreateTransactionBody();
        this._body = body;
        this._inner.setCryptocreateaccount(body);

        // 90 days, required
        this.setAutoRenewPeriod(7890000);
        // Default to maximum values for record thresholds. Without this records would be
        // auto-created whenever a send or receive transaction takes place for this new account.
        // This should be an explicit ask.
        this.setReceiveRecordThreshold(Hbar.MAX);
        this.setSendRecordThreshold(Hbar.MAX);
    }

    public setKey(publicKey: PublicKey): this {
        this._body.setKey(publicKey._toProtoKey());
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setInitialBalance(balance: Tinybar | Hbar): this {
        const hbar = typeof balance === "number" ? Hbar.fromTinybar(balance) : balance as Hbar;
        hbar._check({ allowNegative: false });

        this._body.setInitialbalance(hbar._toProto());
        return this;
    }

    public setReceiveRecordThreshold(threshold: Tinybar | Hbar): this {
        const hbar = typeof threshold === "number" ? Hbar.fromTinybar(threshold) : threshold as Hbar;
        hbar._check({ allowNegative: false });

        this._body.setReceiverecordthreshold(hbar._toProto());
        return this;
    }

    public setSendRecordThreshold(threshold: Tinybar | Hbar): this {
        const hbar = typeof threshold === "number" ? Hbar.fromTinybar(threshold) : threshold as Hbar;
        hbar._check({ allowNegative: false });

        this._body.setSendrecordthreshold(hbar._toProto());
        return this;
    }

    public setReceiverSignatureRequired(required: boolean): this {
        this._body.setReceiversigrequired(required);
        return this;
    }

    public setProxyAccountId(accountId: AccountIdLike): this {
        this._body.setProxyaccountid(new AccountId(accountId)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.createAccount;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasKey()) {
            errors.push("AccountCreateTransaction requires .setKey()");
        }

        if (new BigNumber(this._body.getInitialbalance()).isNegative()) {
            errors.push("AccountCreateTransaction must have a positive setInitialBalance");
        }
    }
}
