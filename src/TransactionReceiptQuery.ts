import { QueryBuilder } from "./QueryBuilder";
import { TransactionGetReceiptQuery as ProtoTransactionGetReceiptQuery } from "./generated/TransactionGetReceipt_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { TransactionReceipt } from "./TransactionReceipt";
import { CryptoService } from "./generated/CryptoService_pb_service";
import { ResponseHeader } from "./generated/ResponseHeader_pb";
import { Status } from "./Status";

export class TransactionReceiptQuery extends QueryBuilder<TransactionReceipt> {
    private readonly _builder: ProtoTransactionGetReceiptQuery;

    public constructor() {
        super();

        this._builder = new ProtoTransactionGetReceiptQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setTransactiongetreceipt(this._builder);
    }

    public setTransactionId(txId: TransactionIdLike): this {
        this._builder.setTransactionid(new TransactionId(txId)._toProto());

        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasTransactionid()) {
            errors.push("`.setTransactionId()` required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getTransactionReceipts;
    }

    protected _shouldRetry(status: Status, response: Response): boolean {
        if (super._shouldRetry(status, response)) return true;

        if (([
            Status.Busy.code,
            Status.Unknown.code,
            Status.ReceiptNotFound.code
        ] as number[]).includes(status.code)) {
            return true;
        }

        // If there _was_ a receipt fetched, check the status of that

        const receipt = response.getTransactiongetreceipt()?.getReceipt();
        const receiptStatus = receipt == null ? null : Status._fromCode(receipt.getStatus());

        if (receiptStatus != null) {
            if (([
                // Accepted but has not reached consensus
                Status.Ok.code,
                // Queue is full
                Status.Busy.code,
                // Still in the node's queue
                Status.Unknown.code,
                Status.ReceiptNotFound.code
            ] as number[]).includes(receiptStatus.code)) {
                return true;
            }
        }

        return false;
    }

    protected _getDefaultExecuteTimeout(): number {
        return 120000; // ~2 minutes
    }

    protected _isPaymentRequired(): boolean {
        // Receipt queries do not require a payment
        return false;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getTransactiongetreceipt()!.getHeader()!;
    }

    protected _mapResponse(response: Response): TransactionReceipt {
        const receipt = response.getTransactiongetreceipt()!;

        return TransactionReceipt._fromProto(receipt.getReceipt()!);
    }
}
