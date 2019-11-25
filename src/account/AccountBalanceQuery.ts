import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { AccountIdLike, accountIdToProto, accountIdToSdk } from "./AccountId";
import { CryptoGetAccountBalanceQuery } from "../generated/CryptoGetAccountBalance_pb";

export type AccountBalance = {
    accountId: AccountIdLike;
    balance: Hbar;
};

export class AccountBalanceQuery extends QueryBuilder<AccountBalance> {
    private readonly _builder: CryptoGetAccountBalanceQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new CryptoGetAccountBalanceQuery();
        this._builder.setHeader(header);
        this._inner.setCryptogetaccountbalance(this._builder);
    }

    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(accountIdToProto(accountId));
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

    protected _mapResponse(response: Response): AccountBalance {
        const accountBalance = response.getCryptogetaccountbalance()!;

        return {
            accountId: accountIdToSdk(accountBalance.getAccountid()!),
            balance: Hbar.fromTinybar(accountBalance.getBalance())
        };
    }
}

