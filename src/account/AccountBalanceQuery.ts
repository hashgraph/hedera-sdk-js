import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/query_pb";
import { Response } from "../generated/response_pb";
import { CryptoService } from "../generated/crypto_service_pb_service";
import { QueryHeader } from "../generated/query_header_pb";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import { CryptoGetAccountBalanceQuery } from "../generated/crypto_get_account_balance_pb";
import { ResponseHeader } from "../generated/response_header_pb";

/**
 * Get the balance of a cryptocurrency account. This returns only the balance, so it is a smaller
 * and faster reply than CryptoGetInfo, which returns the balance plus additional information.
 */
export class AccountBalanceQuery extends QueryBuilder<Hbar> {
    private readonly _builder: CryptoGetAccountBalanceQuery;

    public constructor() {
        super();

        this._builder = new CryptoGetAccountBalanceQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setCryptogetaccountbalance(this._builder);
    }

    /**
     * The account ID for which information is requested.
     */
    public setAccountId(id: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(id)._toProto());
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

    protected _isPaymentRequired(): boolean {
        return false;
    }
}
