import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {CryptoCreateTransactionBody} from "../generated/CryptoCreate_pb";
import {BaseClient} from "../BaseClient";
import {newDuration, tinybarToString} from "../util";
import {PublicKey} from "../Keys";
import BigNumber from "bignumber.js";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {Hbar} from "../Hbar";
import {Tinybar} from "../typedefs";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

export class AccountCreateTransaction extends TransactionBuilder {
    private _body: CryptoCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        const body = new CryptoCreateTransactionBody();
        this._body = body;
        this._inner.setCryptocreateaccount(body);

        // 90 days, required
        this.setAutoRenewPeriod(7890000);
        // Default to maximum values for record thresholds. Without this records would be
        // auto-created whenever a send or receive transaction takes place for this new account.
        // This should be an explicit ask.
        this.setReceiveRecordThreshold(Hbar.MAX_VALUE);
        this.setSendRecordThreshold(Hbar.MAX_VALUE);
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
        this._body.setInitialbalance(tinybarToString(balance));
        return this;
    }

    public setReceiveRecordThreshold(threshold: Tinybar | Hbar): this {
        this._body.setReceiverecordthreshold(tinybarToString(threshold));
        return this;
    }

    public setSendRecordThreshold(threshold: Tinybar | Hbar): this {
        this._body.setSendrecordthreshold(tinybarToString(threshold));
        return this;
    }

    public get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.createAccount;
    }

    public _doValidate(errors: string[]): void {
        if (!this._body.hasKey()) {
            errors.push('AccountCreateTransaction requires setKey()');
        }

        if (new BigNumber(this._body.getInitialbalance()).isZero()) {
            errors.push('AccountCreateTransaction must have nonzero setInitialBalance')
        }
    }
}
