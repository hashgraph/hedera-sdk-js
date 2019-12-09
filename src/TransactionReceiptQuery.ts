import { QueryBuilder } from "./QueryBuilder";
import { TransactionGetReceiptQuery as ProtoTransactionGetReceiptQuery } from "./generated/TransactionGetReceipt_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { receiptToSdk, TransactionReceipt } from "./TransactionReceipt";
import { CryptoService } from "./generated/CryptoService_pb_service";

export class TransactionReceiptQuery extends QueryBuilder<TransactionReceipt> {
    private readonly _builder: ProtoTransactionGetReceiptQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new ProtoTransactionGetReceiptQuery();
        this._builder.setHeader(header);
        this._inner.setTransactiongetreceipt(this._builder);
    }

    public setTransactionId(txId: TransactionIdLike): this {
        this._builder.setTransactionid(new TransactionId(txId)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasTransactionid()) {
            errors.push("`.setTransactionId()` required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getTransactionReceipts;
    }

    protected _mapResponse(response: Response): TransactionReceipt {
        const receipt = response.getTransactiongetreceipt()!;

        return receiptToSdk(receipt.getReceipt()!);
    }
}
