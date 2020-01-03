import { QueryBuilder } from "./QueryBuilder";
import { TransactionGetRecordQuery as ProtoTransactionGetRecordQuery } from "./generated/TransactionGetRecord_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { CryptoService } from "./generated/CryptoService_pb_service";
import { TransactionRecord } from "./TransactionRecord";
import { ResponseHeader } from "./generated/ResponseHeader_pb";

export class TransactionRecordQuery extends QueryBuilder<TransactionRecord> {
    private readonly _builder: ProtoTransactionGetRecordQuery;

    public constructor() {
        super();

        this._builder = new ProtoTransactionGetRecordQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setTransactiongetrecord(this._builder);
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

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getTxRecordByTxID;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getTransactiongetrecord()!.getHeader()!;
    }

    protected _mapResponse(response: Response): TransactionRecord {
        const receipt = response.getTransactiongetrecord()!;

        return TransactionRecord._fromProto(receipt.getTransactionrecord()!);
    }
}
