import { QueryBuilder } from "./QueryBuilder";
import { TransactionGetRecordQuery as ProtoTransactionGetRecordQuery } from "./generated/transaction_get_record_pb";
import { QueryHeader } from "./generated/query_header_pb";
import { TransactionId, TransactionIdLike } from "./TransactionId";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/query_pb";
import { Response } from "./generated/response_pb";
import { CryptoService } from "./generated/crypto_service_pb_service";
import { TransactionRecord } from "./TransactionRecord";
import { ResponseHeader } from "./generated/response_header_pb";
import { BaseClient } from "./BaseClient";
import { HederaReceiptStatusError } from "./errors/HederaReceiptStatusError";
import { HederaRecordStatusError } from "./errors/HederaRecordStatusError";

/**
 * Get the record for a transaction. If the transaction requested a record, then the record lasts
 * for one hour, and a state proof is available for it. If the transaction created an account, file,
 * or smart contract instance, then the record will contain the ID for what it created. If the
 * transaction called a smart contract function, then the record contains the result of that call.
 * If the transaction was a cryptocurrency transfer, then the record includes the TransferList which
 * gives the details of that transfer. If the transaction didn't return anything that should be in
 * the record, then the results field will be set to nothing.
 */
export class TransactionRecordQuery extends QueryBuilder<TransactionRecord> {
    private readonly _builder: ProtoTransactionGetRecordQuery;

    public constructor() {
        super();

        this._builder = new ProtoTransactionGetRecordQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setTransactiongetrecord(this._builder);
    }

    /**
     * The ID of the transaction for which the record is requested.
     */
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
        const header = response.getTransactiongetrecord()!.getHeader();
        return header == null ? new ResponseHeader() : header;
    }

    protected _mapResponse(response: Response): TransactionRecord {
        const receipt = response.getTransactiongetrecord()!;

        return TransactionRecord._fromProto(receipt.getTransactionrecord()!);
    }
}

TransactionId.prototype.getRecord =
    async function(client: BaseClient): Promise<TransactionRecord> {
    // Wait for consensus using a free query first

        try {
            await this.getReceipt(client);
        } catch (error) {
            if (!(error instanceof HederaReceiptStatusError)) {
                throw error;
            }
        }

        const record = await new TransactionRecordQuery()
            .setTransactionId(this)
            .execute(client);

        HederaRecordStatusError._throwIfError(record.receipt!.status.code, record, this);

        return record;
    };
