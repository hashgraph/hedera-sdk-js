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
import { ResponseCode, throwIfExceptional } from "./errors";
import { ResponseCodeEnum } from "./generated/ResponseCode_pb";

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

    protected _shouldRetry(status: ResponseCode, response: Response): boolean {
        if (super._shouldRetry(status, response)) return true;

        if (status === ResponseCodeEnum.OK) {
            const receipt = response.getTransactiongetreceipt()!.getReceipt()!;
            const receiptStatus = receipt.getStatus()! as number;

            if (([
                // Accepted but has not reached consensus
                ResponseCodeEnum.OK,
                // Queue is full
                ResponseCodeEnum.BUSY,
                // Still in the node's queue
                ResponseCodeEnum.UNKNOWN
            ] as number[]).includes(receiptStatus)) {
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

        // Throw an exception on an invalid receipt status
        throwIfExceptional(receipt.getReceipt()!.getStatus()!, true);

        return TransactionReceipt._fromProto(receipt.getReceipt()!);
    }
}
