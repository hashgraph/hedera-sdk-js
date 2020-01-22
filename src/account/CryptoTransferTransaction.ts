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

import { Hbar, Tinybar } from "../Hbar";
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
        const hbar = typeof amount === "number" ? Hbar.fromTinybar(amount) : amount as Hbar;
        hbar._check({ allowNegative: false });

        return this.addTransfer(accountId, hbar.negated());
    }

    public addRecipient(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const hbar = typeof amount === "number" ? Hbar.fromTinybar(amount) : amount as Hbar;
        hbar._check({ allowNegative: false });

        return this.addTransfer(accountId, hbar);
    }

    public addTransfer(accountId: AccountIdLike, amount: Hbar): this {
        const transfers = this._body.getTransfers() || new TransferList();
        this._body.setTransfers(transfers);

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(new AccountId(accountId)._toProto());
        acctAmt.setAmount(amount._toProto());

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
