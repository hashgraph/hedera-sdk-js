import { BaseClient } from "./BaseClient";
import { TransactionBody } from "./generated/TransactionBody_pb";
import {
    newDuration,
    runValidation
} from "./util";
import { Transaction } from "./Transaction";
import { Transaction as Transaction_ } from "./generated/Transaction_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TransactionResponse } from "./generated/TransactionResponse_pb";

import { Hbar, Tinybar } from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { AccountId, AccountIdLike } from "./account/AccountId";
import { TransactionId, TransactionIdLike } from "./TransactionId";

/**
 * Max duration of transactions on the network is 2 minutes
 */
const maxValidDuration = 120;

export abstract class TransactionBuilder {
    protected readonly _inner: TransactionBody;

    private _node?: AccountId;

    protected constructor() {
        this._inner = new TransactionBody();
        this._inner.setTransactionvalidduration(newDuration(120));
    }

    public setTransactionId(id: TransactionIdLike): this {
        this._inner.setTransactionid((id instanceof TransactionId ? id : new TransactionId(id))
            ._toProto());
        return this;
    }

    public setTransactionValidDuration(seconds: number): this {
        this._inner.setTransactionvalidduration(newDuration(Math.min(seconds, maxValidDuration)));
        return this;
    }

    public setMaxTransactionFee(fee: Tinybar | Hbar): this {
        const hbar = typeof fee === "number" ? Hbar.fromTinybar(fee) : fee as Hbar;
        hbar._check();

        this._inner.setTransactionfee(hbar._toProto());
        return this;
    }

    public setNodeAccountId(nodeAccountId: AccountIdLike): this {
        this._node = new AccountId(nodeAccountId);
        this._inner.setNodeaccountid(this._node._toProto());
        return this;
    }

    public setTransactionMemo(memo: string): this {
        this._inner.setMemo(memo);
        return this;
    }

    public setGenerateRecord(generateRecord: boolean): this {
        this._inner.setGeneraterecord(generateRecord);
        return this;
    }

    protected abstract get _method(): UnaryMethodDefinition<Transaction_, TransactionResponse>;

    protected abstract _doValidate(errors: string[]): void;

    public validate(): void {
        runValidation(this, (errors) => {
            if (!this._inner.hasTransactionid()) {
                errors.push("missing ID for transaction");
            }

            // strings are UTF-16, max 100 bytes
            if (this._inner.getMemo().length * 2 > 100) {
                errors.push("memo may not be longer than 100 bytes");
            }

            this._doValidate(errors);
        });
    }

    public build(client?: BaseClient): Transaction {
        // Don't override TransactionFee if it's already set

        if (client && this._inner.getTransactionfee() === "0") {
            this._inner.setTransactionfee(client.maxTransactionFee._toProto());
        }

        if (client && !this._inner.hasTransactionid()) {
            if (client._getOperatorAccountId()) {
                const tx = new TransactionId(client._getOperatorAccountId()!);
                this._inner.setTransactionid(tx._toProto());
            }
        }

        if (!this._inner.hasTransactionvalidduration()) {
            this.setTransactionValidDuration(maxValidDuration);
        }

        // Set `this._node` accordingly if client is supplied otherwise error out
        if (!this._node && !client) {
            throw new Error("`setNodeAccountId` must be called if client is not supplied");
        }

        if (!this._node) {
            this._node = client!._randomNode().id;
        }

        if (this._node && !this._inner.hasNodeaccountid()) {
            this.setNodeAccountId(this._node);
        }

        this.validate();

        const protoTx = new Transaction_();
        protoTx.setBodybytes(this._inner.serializeBinary());

        return new Transaction(this._node, protoTx, this._inner, this._method);
    }

    public execute(client: BaseClient): Promise<TransactionId> {
        return this.build(client).execute(client);
    }
}
