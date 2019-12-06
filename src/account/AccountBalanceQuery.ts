import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountBalanceQuery } from "../generated/CryptoGetAccountBalance_pb";

export class AccountBalanceQuery extends QueryBuilder<Hbar> {
    private readonly _builder: CryptoGetAccountBalanceQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new CryptoGetAccountBalanceQuery();
        this._builder.setHeader(header);
        this._inner.setCryptogetaccountbalance(this._builder);
    }

    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(accountId)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.cryptoGetBalance;
    }

    protected _mapResponse(response: Response): Hbar {
        const accountBalance = response.getCryptogetaccountbalance()!;

        return Hbar.fromTinybar(accountBalance.getBalance());
    }
}

