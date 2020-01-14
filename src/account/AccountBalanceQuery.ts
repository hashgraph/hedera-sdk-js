import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountBalanceQuery } from "../generated/CryptoGetAccountBalance_pb";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { ContractId, ContractIdLike } from "../contract/ContractId";

export class AccountBalanceQuery extends QueryBuilder<Hbar> {
    private readonly _builder: CryptoGetAccountBalanceQuery;

    public constructor() {
        super();

        this._builder = new CryptoGetAccountBalanceQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setCryptogetaccountbalance(this._builder);
    }

    public setAccountId(id: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(id)._toProto());
        return this;
    }

    public setContractId(id: ContractIdLike): this {
        const contractId = new ContractId(id);
        const accountId = new AccountId(contractId.shard, contractId.realm, contractId.contract);
        this._builder.setAccountid(accountId._toProto());
        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.cryptoGetBalance;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getCryptogetaccountbalance()!.getHeader()!;
    }

    protected _mapResponse(response: Response): Hbar {
        const accountBalance = response.getCryptogetaccountbalance()!;

        return Hbar.fromTinybar(accountBalance.getBalance());
    }
}

