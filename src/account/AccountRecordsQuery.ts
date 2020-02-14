import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountRecordsQuery } from "../generated/CryptoGetAccountRecords_pb";
import { TransactionRecord } from "../TransactionRecord";
import { ResponseHeader } from "../generated/ResponseHeader_pb";

/**
 * Get all the records for an account for any transfers into it and out of it, that were above the
 * threshold, during the last 25 hours.
 */
export class AccountRecordsQuery extends QueryBuilder<TransactionRecord[]> {
    private readonly _builder: CryptoGetAccountRecordsQuery;

    public constructor() {
        super();

        this._builder = new CryptoGetAccountRecordsQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setCryptogetaccountrecords(this._builder);
    }

    /**
     * The account that this record is for.
     */
    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(accountId)._toProto());
        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getAccountRecords;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getCryptogetaccountrecords()!.getHeader()!;
    }

    protected _mapResponse(response: Response): TransactionRecord[] {
        const accountInfo = response.getCryptogetaccountrecords()!;

        return accountInfo.getRecordsList().map(TransactionRecord._fromProto);
    }
}

