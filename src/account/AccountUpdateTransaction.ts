import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoUpdateTransactionBody } from "../generated/CryptoUpdate_pb";
import { newDuration } from "../util";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { Hbar } from "../Hbar";
import { Tinybar, tinybarToUInt64Value } from "../Tinybar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { PublicKey } from "../crypto/PublicKey";
import { AccountId, AccountIdLike } from "./AccountId";

export class AccountUpdateTransaction extends TransactionBuilder {
    private _body: CryptoUpdateTransactionBody;

    public constructor() {
        super();
        const body = new CryptoUpdateTransactionBody();
        this._body = body;
        this._inner.setCryptoupdateaccount(body);
    }

    public setAccountId(id: AccountIdLike): this {
        this._body.setAccountidtoupdate(new AccountId(id)._toProto());
        return this;
    }

    public setKey(publicKey: PublicKey): this {
        this._body.setKey(publicKey._toProtoKey());
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setReceiveRecordThreshold(threshold: Tinybar | Hbar): this {
        this._body.setReceiverecordthresholdwrapper(tinybarToUInt64Value(threshold));
        return this;
    }

    public setSendRecordThreshold(threshold: Tinybar | Hbar): this {
        this._body.setSendrecordthresholdwrapper(tinybarToUInt64Value(threshold));
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
