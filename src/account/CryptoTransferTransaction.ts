import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {
    AccountAmount,
    CryptoTransferTransactionBody,
    TransferList
} from "../generated/CryptoTransfer_pb";
import {accountIdToProto, tinybarRangeCheck, tinybarToString} from "../util";
import BigNumber from "bignumber.js";
import {CryptoService} from "../generated/CryptoService_pb_service";

import {Tinybar} from "../types/Tinybar";
import {Hbar} from "../Hbar";
import {AccountIdLike} from "../types/AccountId";

export class CryptoTransferTransaction extends TransactionBuilder {
    private readonly body: CryptoTransferTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new CryptoTransferTransactionBody();
        this.body.setTransfers(new TransferList());
        this.inner.setCryptotransfer(this.body);
    }

    protected doValidate(errors: string[]): void {
        const amts = this.body.getTransfers()!.getAccountamountsList();

        if (amts.length === 0) {
            errors.push('CryptoTransferTransaction must have at least one transfer');
            return;
        }

        const sum = amts.reduce(
            (lastSum, acctAmt) => lastSum.plus(acctAmt.getAmount()),
            new BigNumber(0));

        if (!sum.isZero()) {
            errors.push('CryptoTransferTransaction must have zero sum; got: ' + sum);
        }
    }

    public addSender(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        tinybarRangeCheck(amount);
        const negated = typeof amount === 'number' ? -amount : amount.negated();
        return this.addTransfer(accountId, negated);
    }

    public addRecipient(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        tinybarRangeCheck(amount);
        return this.addTransfer(accountId, amount);
    }

    public addTransfer(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const transfers = this.body.getTransfers() || new TransferList();
        this.body.setTransfers(transfers);

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(accountIdToProto(accountId));
        acctAmt.setAmount(tinybarToString(amount, 'allowNegative'));

        transfers.addAccountamounts(acctAmt);

        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.cryptoTransfer;
    }
}
