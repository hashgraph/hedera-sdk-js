import { QueryBuilder } from "./QueryBuilder";
import { TransactionGetRecordQuery as ProtoTransactionGetRecordQuery } from "./generated/TransactionGetRecord_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { CryptoService } from "./generated/CryptoService_pb_service";
import { recordListToSdk, TransactionRecord } from "./TransactionRecord";

export class TransactionRecordQuery extends QueryBuilder<TransactionRecord> {
    private readonly _builder: ProtoTransactionGetRecordQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new ProtoTransactionGetRecordQuery();
        this._builder.setHeader(header);
        this._inner.setTransactiongetrecord(this._builder);
    }

    public setTransactionId(txId: TransactionIdLike): this {
        this._builder.setTransactionid(new TransactionId(txId).toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasTransactionid()) {
            errors.push("`.setTransactionId()` required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getTxRecordByTxID;
    }

    protected _mapResponse(response: Response): TransactionRecord {
        const receipt = response.getTransactiongetrecord()!;

        return recordListToSdk([ receipt.getTransactionrecord()! ])[ 0 ];
    }
}
