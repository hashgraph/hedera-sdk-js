import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/query_pb";
import { Response } from "../generated/response_pb";
import { CryptoService } from "../generated/crypto_service_pb_service";
import { QueryHeader } from "../generated/query_header_pb";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountRecordsQuery } from "../generated/crypto_get_account_records_pb";
import { TransactionRecord } from "../TransactionRecord";
import { ResponseHeader } from "../generated/response_header_pb";

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
