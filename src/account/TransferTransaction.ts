import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoTransferTransactionBody } from "../generated/CryptoTransfer_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { AccountAmount, TransferList, TokenTransferList } from "../generated/BasicTypes_pb";
import { TokenId, TokenIdLike } from "../token/TokenId";
import {
    Hbar,
    Tinybar,
    hbarCheck,
    hbarFromTinybarOrHbar,
    hbarToProto
} from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import BigNumber from "bignumber.js";

/**
 * Transfer tokens from some accounts to other accounts. Each negative amount is withdrawn from the corresponding
 * account (a sender), and each positive one is added to the corresponding account (a receiver). All amounts must
 * have sum of zero.
 * Each amount is a number with the lowest denomination possible for a token. Example:
 * Token X has 2 decimals. Account A transfers amount of 100 tokens by providing 10000 as amount in the TransferList.
 * If Account A wants to send 100.55 tokens, he must provide 10055 as amount.
 *
 * If any sender account fails to have sufficient token balance, then the entire transaction fails and none of the
 * transfers occur, though transaction fee is still charged.
 */
export class TransferTransaction extends SingleTransactionBuilder {
    private readonly _body: CryptoTransferTransactionBody;
    private _tokenIdIndexes: Map<string, number>;

    public constructor() {
        super();
        this._body = new CryptoTransferTransactionBody();
        this._tokenIdIndexes = new Map();
        this._body.setTokentransfersList([]);
        this._body.setTransfers(new TransferList());
        this._inner.setCryptotransfer(this._body);
    }

    /**
     * A list of senders with a given amount.
     */
    public addHbarSender(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        return this.addHbarTransfer(accountId, hbar.negated());
    }

    /**
     * A list of receivers with a given amount.
     */
    public addHbarRecipient(
        accountId: AccountIdLike,
        amount: Tinybar | Hbar
    ): this {
        const hbar = hbarFromTinybarOrHbar(amount);
        hbar[ hbarCheck ]({ allowNegative: false });

        return this.addHbarTransfer(accountId, amount);
    }

    /**
     * addHbar a transfer to the list of transfers. Negative values are `senders` and
     * postitive values are `receivers`. Perfer using `CryptoTransferTransaction.addHbarSender()`
     * and `CryptoTransferTransaction.addHbarRecipient()` instead as those methods automatically
     * negate the values appropriately.
     */
    public addHbarTransfer(accountId: AccountIdLike, amount: Tinybar | Hbar): this {
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

    public addTokenSender(
        tokenId: TokenIdLike,
        accountId: AccountIdLike,
        amount: number | BigNumber
    ): this {
        return this.addTokenTransfer(
            tokenId,
            accountId,
            amount instanceof BigNumber ?
                amount.negated() :
                new BigNumber(amount).negated()
        );
    }

    public addTokenRecipient(
        tokenId: TokenIdLike,
        accountId: AccountIdLike,
        amount: number | BigNumber
    ): this {
        return this.addTokenTransfer(
            tokenId,
            accountId,
            amount instanceof BigNumber ?
                amount :
                new BigNumber(amount)
        );
    }

    public addTokenTransfer(
        tokenId: TokenIdLike,
        accountId: AccountIdLike,
        amount: number | BigNumber
    ): this {
        const index = this._tokenIdIndexes.get(new TokenId(tokenId).toString());
        const token = new TokenId(tokenId);

        if (index == null) {
            this._tokenIdIndexes.set(token.toString(), this._body.getTokentransfersList().length);
        }

        let list: TokenTransferList;

        if (index != null) {
            list = this._body.getTokentransfersList()[ index ];
        } else {
            list = new TokenTransferList();
            this._body.addTokentransfers(list);
        }

        list.setToken(token._toProto());
        const transfers = list.getTransfersList();

        const acctAmt = new AccountAmount();
        acctAmt.setAccountid(new AccountId(accountId)._toProto());
        acctAmt.setAmount(amount instanceof BigNumber ?
            amount.toString(10) :
            new BigNumber(amount).toString(10));

        transfers.push(acctAmt);

        return this;
    }

    protected _doValidate(_: string[]): void {}

    protected get _method(): grpc.UnaryMethodDefinition<
        Transaction,
        TransactionResponse
        > {
        return CryptoService.cryptoTransfer;
    }
}
