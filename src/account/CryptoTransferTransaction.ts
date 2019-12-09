import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import {
    AccountAmount,
    CryptoTransferTransactionBody,
    TransferList
} from "../generated/CryptoTransfer_pb";
import BigNumber from "bignumber.js";
import { CryptoService } from "../generated/CryptoService_pb_service";

import { Tinybar, tinybarRangeCheck, tinybarToString } from "../Tinybar";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";

export class CryptoTransferTransaction extends TransactionBuilder {
    private readonly _body: CryptoTransferTransactionBody;

    public constructor() {
        super();
        this._body = new CryptoTransferTransactionBody();
        this._body.setTransfers(new TransferList());
        this._inner.setCryptotransfer(this._body);
    }

    public addSender(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        tinybarRangeCheck(amount);
        const negated = typeof amount === "number" ? -amount : amount.negated();
        return this.addTransfer(accountId, negated);
    }

    public addRecipient(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        tinybarRangeCheck(amount);
        return this.addTransfer(accountId, amount);
    }

    public addTransfer(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const transfers = this._body.getTransfers() || new TransferList();
        this._body.setTransfers(transfers);

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(new AccountId(accountId)._toProto());
        acctAmt.setAmount(tinybarToString(amount, "allowNegative"));

        transfers.addAccountamounts(acctAmt);

        return this;
    }

    protected _doValidate(errors: string[]): void {
        const amts = this._body.getTransfers()!.getAccountamountsList();

        if (amts.length === 0) {
            errors.push("CryptoTransferTransaction must have at least one transfer");
            return;
        }

        const sum = amts.reduce(
            (lastSum, acctAmt) => lastSum.plus(acctAmt.getAmount()),
            new BigNumber(0)
        );

        if (!sum.isZero()) {
            errors.push(`CryptoTransferTransaction must have zero sum; got: ${sum}`);
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.cryptoTransfer;
    }
}
