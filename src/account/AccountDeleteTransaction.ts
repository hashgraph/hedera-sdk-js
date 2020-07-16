import { SingleTransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { CryptoService } from "../generated/CryptoService_pb_service";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { CryptoDeleteTransactionBody } from "../generated/CryptoDelete_pb";
import { AccountId, AccountIdLike } from "./AccountId";

/**
 * Mark an account as deleted, moving all its current hbars to another account. It will remain in
 * the ledger, marked as deleted, until it expires. Transfers into it a deleted account fail. But
 * a deleted account can still have its expiration extended in the normal way.
 */
export class AccountDeleteTransaction extends SingleTransactionBuilder {
    private _body: CryptoDeleteTransactionBody;

    public constructor() {
        super();
        const body = new CryptoDeleteTransactionBody();
        this._body = body;
        this._inner.setCryptodelete(body);
    }

    /**
     * Sets the account to delete. Note: To successfully delete an account
     * one must also manually set the `TransactionId` to a `TransactionId`
     * constructed from the same `AccountId`
     *
     * The account ID which should be deleted.
     */
    public setDeleteAccountId(accountId: AccountIdLike): this {
        this._body.setDeleteaccountid(new AccountId(accountId)._toProto());
        return this;
    }

    /**
     * The account ID which will receive all remaining hbars.
     */
    public setTransferAccountId(accountId: AccountIdLike): this {
        this._body.setTransferaccountid(new AccountId(accountId)._toProto());
        return this;
    }

    protected get _method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.cryptoDelete;
    }

    public _doValidate(errors: string[]): void {
        if (!this._body.hasDeleteaccountid()) {
            errors.push("AccountDeleteTransaction requires .setAccountid()");
        }
    }
}
