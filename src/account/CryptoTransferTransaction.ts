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
import {getProtoAccountId, reqDefined, toTinybarString} from "../util";
import BigNumber from "bignumber.js";
import {CryptoService} from "../generated/CryptoService_pb_service";

import {AccountId} from "../typedefs";
import {Hbar} from "../Hbar";

export class CryptoTransferTransaction extends TransactionBuilder {
    private readonly body: CryptoTransferTransactionBody;

    constructor(client: BaseClient) {
        super(client);
        this.body = new CryptoTransferTransactionBody();
        this.inner.setCryptotransfer(this.body);
    }

    protected doValidate(): void {
        const missingTransfers = 'CryptoTransferTransaction must have at least one transfer';
        const transfers = reqDefined(this.body.getTransfers(), missingTransfers);

        const amts = transfers.getAccountamountsList();

        if (amts.length === 0) {
            throw new Error(missingTransfers);
        }

        const sum = amts.reduce(
            (lastSum, acctAmt) => lastSum.plus(acctAmt.getAmount()),
            new BigNumber(0));

        if (!sum.isZero()) {
            throw new Error('CryptoTransferTransaction must have zero sum; got: ' + sum);
        }
    }

    addSender(accountId: AccountId, amount: number | BigNumber | Hbar): this {
        if (amount instanceof Hbar || amount instanceof BigNumber) {
            if (amount.isNegative()) {
                throw new Error('sending amount may not be negative');
            }

            return this.addTransfer(accountId, amount.negated());
        } else {
            if (amount < 0) {
                throw new Error('sending amount may not be negative');
            }

            return this.addTransfer(accountId, -amount);
        }
    }

    addRecipient(accountId: AccountId, amount: number | BigNumber | Hbar): this {
        return this.addTransfer(accountId, amount);
    }

    addTransfer(accountId: AccountId, amount: number | BigNumber | Hbar): this {
        const transfers = this.body.getTransfers() || new TransferList();
        this.body.setTransfers(transfers);

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(getProtoAccountId(accountId));
        acctAmt.setAmount(toTinybarString(amount));

        transfers.addAccountamounts(acctAmt);

        return this;
    }

    get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.cryptoTransfer;
    }
}
