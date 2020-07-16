import { SingleTransactionBuilder } from "../TransactionBuilder";
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

import { Hbar, Tinybar, hbarCheck, hbarFromTinybarOrHbar, hbarToProto } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";

/**
 * Transfer cryptocurrency from some accounts to other accounts. The accounts list can contain up
 * to 10 accounts. The amounts list must be the same length as the accounts list. Each negative
 * amount is withdrawn from the corresponding account (a sender), and each positive one is added
 * to the corresponding account (a receiver). The amounts list must sum to zero. Each amount is a
 * number of tinyBars (there are 100,000,000 tinyBars in one Hbar). If any sender account fails to
 * have sufficient hbars to do the withdrawal, then the entire transaction fails, and none of those
 * transfers occur, though the transaction fee is still charged. This transaction must be signed by
 * the keys for all the sending accounts, and for any receiving accounts that have
 * receiverSigRequired == true. The signatures are in the same order as the accounts, skipping those
 * accounts that don't need a signature.
 */
export class CryptoTransferTransaction extends SingleTransactionBuilder {
    private readonly _body: CryptoTransferTransactionBody;

    public constructor() {
        super();
        this._body = new CryptoTransferTransactionBody();
        this._body.setTransfers(new TransferList());
        this._inner.setCryptotransfer(this._body);
    }

    /**
     * A list of senders with a given amount.
     */
    public addSender(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        return this.addTransfer(accountId, hbar.negated());
    }

    /**
     * A list of receivers with a given amount.
     */
    public addRecipient(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        return this.addTransfer(accountId, amount);
    }

    /**
     * Add a transfer to the list of transfers. Negative values are `senders` and
     * postitive values are `receivers`. Perfer using `CryptoTransferTransaction.addSender()`
     * and `CryptoTransferTransaction.addRecipient()` instead as those methods automatically
     * negate the values appropriately.
     */
    public addTransfer(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const amountHbar = hbarFromTinybarOrHbar(amount);
        amountHbar[ hbarCheck ]({ allowNegative: true });

        const transfers = this._body.getTransfers() || new TransferList();
        this._body.setTransfers(transfers);

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(new AccountId(accountId)._toProto());
        acctAmt.setAmount(amountHbar[ hbarToProto ]());

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
