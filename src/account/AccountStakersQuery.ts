import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetStakersQuery } from "../generated/CryptoGetStakers_pb";

export interface ProxyStaker {
    accountId: AccountId;
    amount: number;
}

export class AccountStakersQuery extends QueryBuilder<ProxyStaker[]> {
    private readonly _builder: CryptoGetStakersQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new CryptoGetStakersQuery();
        this._builder.setHeader(header);
        this._inner.setCryptogetproxystakers(this._builder);
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
        return CryptoService.getStakersByAccountID;
    }

    protected _mapResponse(response: Response): ProxyStaker[] {
        const allStakers = response.getCryptogetproxystakers()!;

        return allStakers.getStakers()!.getProxystakerList().map((staker) => ({
            accountId: AccountId.fromProto(staker.getAccountid()!),
            amount: staker.getAmount()
        }));
    }
}
