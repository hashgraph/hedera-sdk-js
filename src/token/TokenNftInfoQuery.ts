import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { NftId } from "./NftId";
import { TokenId } from "./TokenId";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { TokenNftInfo as ProtoTokenNftInfo, TokenGetNftInfoQuery } from "../generated/TokenGetNftInfo_pb";
import { TokenGetNftInfosQuery } from "../generated/TokenGetNftInfos_pb";
import { TokenGetAccountNftInfoQuery } from "../generated/TokenGetAccountNftInfo_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { AccountId } from "../account/AccountId";
import { timestampToDate } from "../Timestamp";

/**
 * Response when the client sends the node TokenGetNftInfoQuery.
 */
export interface TokenNftInfo {
    /**
     * The ID of the NFT
     */
    nftId: NftId | null;

    /**
     * The current owner of the NFT
     */
    accountId: AccountId | null;

    /**
     * The effective consensus timestamp at which the NFT was minted
     */
    creationTime: Date | null;

    /**
     * Represents the unique metadata of the NFT
     */
    metadata: Uint8Array | null;
}

/**
 * Get all the information about an token, including the balance.
 * This does not get the list of token records.
 */
export class TokenNftInfoQuery extends QueryBuilder<TokenNftInfo[]> {
    private readonly _byNftBuilder: TokenGetNftInfoQuery;
    private readonly _byTokenBuilder: TokenGetNftInfosQuery;
    private readonly _byAccountBuilder: TokenGetAccountNftInfoQuery;

    public constructor() {
        super();

        this._byNftBuilder = new TokenGetNftInfoQuery();
        this._byTokenBuilder = new TokenGetNftInfosQuery();
        this._byAccountBuilder = new TokenGetAccountNftInfoQuery();

        this._byNftBuilder.setHeader(new QueryHeader());
        this._byTokenBuilder.setHeader(new QueryHeader());
        this._byAccountBuilder.setHeader(new QueryHeader());
    }

    public byNft(nftId: NftId): this {
        this._byNftBuilder.setNftid(nftId._toProto());

        this._inner.clearTokengetnftinfo();
        this._inner.clearTokengetnftinfos();
        this._inner.clearTokengetaccountnftinfo();

        this._inner.setTokengetnftinfo(this._byNftBuilder);
        return this;
    }

    public byTokenId(tokenId: TokenId): this {
        this._byTokenBuilder.setTokenid(tokenId._toProto());

        this._inner.clearTokengetnftinfo();
        this._inner.clearTokengetnftinfos();
        this._inner.clearTokengetaccountnftinfo();

        this._inner.setTokengetnftinfos(this._byTokenBuilder);
        return this;
    }

    public byAccountId(accountId: AccountId): this {
        this._byAccountBuilder.setAccountid(accountId._toProto());

        this._inner.clearTokengetnftinfo();
        this._inner.clearTokengetnftinfos();
        this._inner.clearTokengetaccountnftinfo();

        this._inner.setTokengetaccountnftinfo(this._byAccountBuilder);
        return this;
    }

    /**
     * Wrapper around `QueryBuilder.getCost()`. This must exist because the cost returned
     * `QueryBuilder.getCost()` and therein the Hedera Network doesn't work for any
     * acocuntns that have been deleted. In that case we want the minimum
     * cost to be ~25 Tinybar as this seems to succeed most of the time.
     */
    public async getCost(client: BaseClient): Promise<Hbar> {
        // deleted tokens return a COST_ANSWER of zero which triggers `INSUFFICIENT_TX_FEE`
        // if you set that as the query payment; 25 tinybar seems to be enough to get
        // `TOKEN_DELETED` back instead.
        const min = Hbar.fromTinybar(25);
        const cost = await super.getCost(client);
        return cost.isGreaterThan(min) ? cost : min;
    }

    protected _doLocalValidate(_: string[]): void {}

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return TokenService.getTokenNftInfo;
    }

    protected _getHeader(): QueryHeader {
        if (this._byAccountBuilder.hasAccountid()) {
            return this._byAccountBuilder.getHeader()!;
        } else if (this._byTokenBuilder.hasTokenid()) {
            return this._byTokenBuilder.getHeader()!;
        }
        return this._byNftBuilder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        if (this._byAccountBuilder.hasAccountid()) {
            return response.getTokengetaccountnftinfo()!.getHeader()!;
        } else if (this._byTokenBuilder.hasTokenid()) {
            return response.getTokengetnftinfos()!.getHeader()!;
        }
        return response.getTokengetnftinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): TokenNftInfo[] {
        let infos: ProtoTokenNftInfo[];
        if (this._byAccountBuilder.hasAccountid()) {
            infos = response.getTokengetaccountnftinfo()!.getNftsList()!;
        } else if (this._byTokenBuilder.hasTokenid()) {
            infos = response.getTokengetnftinfos()!.getNftsList()!;
        } else {
            infos = [ response.getTokengetnftinfo()!.getNft()! ];
        }

        return infos.map((info) => ({
            nftId: info.hasNftid() ? NftId._fromProto(info.getNftid()!) : null,
            accountId: info.hasAccountid() ? AccountId._fromProto(info.getAccountid()!) : null,
            creationTime: info.hasCreationtime() ?
                timestampToDate(info.getCreationtime()!) :
                null,
            metadata: info.getMetadata_asU8()
        }));
    }
}
