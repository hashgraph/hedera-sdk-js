import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { AccountId, AccountIdLike } from "../account/AccountId";
import { CryptoGetAccountBalanceQuery, TokenBalance as ProtoTokenBalance } from "../generated/CryptoGetAccountBalance_pb";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { TokenId, TokenIdLike } from "./TokenId";
import BigNumber from "bignumber.js";

export class TokenBalanceMap {
    private _balances: Map<string, BigNumber> = new Map();

    public constructor(balances: ProtoTokenBalance[]) {
        for (const balance of balances) {
            const tokenId = TokenId._fromProto(balance.getTokenid()!);

            this._balances.set(
                tokenId.toString(),
                new BigNumber(balance.getBalance()!)
            );
        }
    }

    public get(tokenId: TokenIdLike): BigNumber | undefined {
        const token = new TokenId(tokenId).toString();
        return this._balances.get(token);
    }

    public values(): IterableIterator<BigNumber> {
        return this._balances.values();
    }

    public keys(): IterableIterator<TokenId> {
        const keys = [];
        for (const key of this._balances.keys()) {
            keys.push(TokenId.fromString(key));
        }
        return keys[ Symbol.iterator ]();
    }

    public [ Symbol.iterator ](): IterableIterator<[TokenId, BigNumber]> {
        const map = new Map();
        for (const [ key, value ] of this._balances) {
            map.set(TokenId.fromString(key), value);
        }
        return map[ Symbol.iterator ]();
    }

    public toString(): string {
        let s = "{\n";
        for (const [ key, value ] of this._balances) {
            s += `\t{\n\t\tokenId: ${key.toString()},\n\t\balance: ${value.toString()}\n\t},\n`;
        }
        s += "}\n";
        return s;
    }
}

/**
 * Get the balance of a cryptocurrency token. This returns only the balance, so it is a smaller
 * and faster reply than CryptoGetInfo, which returns the balance plus additional information.
 */
export class TokenBalanceQuery extends QueryBuilder<TokenBalanceMap> {
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

    protected _doLocalValidate(_: string[]): void {
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

    protected _mapResponse(response: Response): TokenBalanceMap {
        const accountBalance = response.getCryptogetaccountbalance()!;
        return new TokenBalanceMap(accountBalance.getTokenbalancesList()!);
    }

    protected _isPaymentRequired(): boolean {
        return false;
    }
}
