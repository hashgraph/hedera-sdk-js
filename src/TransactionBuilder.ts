import { BaseClient } from "./BaseClient";
import { TransactionBody } from "./generated/TransactionBody_pb";
import {
    newDuration,
    runValidation
} from "./util";
import { Transaction, transactionCreate, transactionCall } from "./Transaction";
import { Transaction as Transaction_ } from "./generated/Transaction_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { TransactionResponse } from "./generated/TransactionResponse_pb";

import { Hbar, Tinybar, hbarFromTinybarOrHbar, hbarCheck, hbarToProto } from "./Hbar";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;
import { AccountId, AccountIdLike } from "./account/AccountId";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { Status } from "./Status";
import { HederaPrecheckStatusError } from "./errors/HederaPrecheckStatusError";
import BigNumber from "bignumber.js";

/**
 * Max duration of transactions on the network is 2 minutes
 */
const maxValidDuration = 120;

export abstract class TransactionBuilder<O = Transaction> {
    protected readonly _inner: TransactionBody;
    protected _shouldSetFee = true;

    protected _node?: AccountId;

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
        const hbar = hbarFromTinybarOrHbar(fee);
        // const hbar = typeof fee === "number" ? Hbar.fromTinybar(fee) : fee as Hbar;
        hbar[ hbarCheck ]({ allowNegative: false });

        this._inner.setTransactionfee(hbar[ hbarToProto ]());
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

    public abstract getCost(client: BaseClient): Promise<Hbar>;
    public abstract build(client?: BaseClient): O;
}

export class SingleTransactionBuilder extends TransactionBuilder<Transaction> {
    public async getCost(client: BaseClient): Promise<Hbar> {
        const originalFee = this._inner.getTransactionfee();

        try {
            // We get the cost by trying to run the transaction with a zero fee
            this._inner.setTransactionfee("0");
            this._shouldSetFee = false;

            const tx = this.build(client);

            const response = await tx[ transactionCall ](client);
            const status: Status = Status._fromCode(response.getNodetransactionprecheckcode());

            if (status === Status.InsufficientTxFee) {
                // NOTE: The actual cost returned by Hedera is within 99.8% to 99.9% of the actual
                //       fee that will be assessed. We're unsure if this is because the fee fluctuates that
                //       much or if the calculations are simply incorrect on the server. To compensate for
                //       this we just bump by a 1% the value returned. As this would only ever be
                //       a maximum this will not cause you to be charged more.

                let estimatedFee = new BigNumber(response.getCost());
                estimatedFee = estimatedFee.multipliedBy(1.01).decimalPlaces(0);

                return Hbar.fromTinybar(estimatedFee);
            }

            HederaPrecheckStatusError._throwIfError(status.code, tx.id);
        } finally {
            // Reset the contained transaction body
            this._shouldSetFee = true;
            this._inner.setTransactionfee(originalFee);
            this._inner.clearTransactionid();
            this._inner.clearTransactionvalidduration();

            // NOTE: The Node ID is explicitly not cleared as we want to use the same node to execute
            //       as we just used to ask for the cost
            // this._inner.clearNodeaccountid();
        }

        // Cost of the transaction was 0?
        return new Hbar(0);
    }

    public build(client?: BaseClient): Transaction {
        if (client && this._shouldSetFee && this._inner.getTransactionfee() === "0") {
            // Don't override TransactionFee if it's already set
            this._inner.setTransactionfee(client._maxTransactionFee[ hbarToProto ]());
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

        return Transaction[ transactionCreate ](this._node, protoTx, this._inner, this._method);
    }

    public execute(client: BaseClient): Promise<TransactionId> {
        return this.build(client).execute(client);
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction_, TransactionResponse> {
        throw new Error("Method not implemented.");
    }

    protected _doValidate(_: string[]): void {
        throw new Error("Method not implemented.");
    }
}
