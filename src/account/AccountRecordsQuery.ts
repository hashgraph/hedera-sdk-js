import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountRecordsQuery } from "../generated/CryptoGetAccountRecords_pb";
import { recordListToSdk, TransactionRecord } from "../TransactionRecord";

export class AccountRecordsQuery extends QueryBuilder<TransactionRecord[]> {
    private readonly _builder: CryptoGetAccountRecordsQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new CryptoGetAccountRecordsQuery();
        this._builder.setHeader(header);
        this._inner.setCryptogetaccountrecords(this._builder);
    }

    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(accountId).toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getAccountRecords;
    }

    protected _mapResponse(response: Response): TransactionRecord[] {
        const accountInfo = response.getCryptogetaccountrecords()!;

        return recordListToSdk(accountInfo.getRecordsList());
    }
}

