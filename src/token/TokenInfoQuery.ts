import { QueryBuilder } from "../QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { TokenId, TokenIdLike } from "./TokenId";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { TokenGetInfoQuery } from "../generated/TokenGetInfo_pb";
import { TokenService } from "../generated/TokenService_pb_service";
import { AccountId } from "../account/AccountId";
import { PublicKey, _fromProtoKey } from "../crypto/PublicKey";
import { timestampToDate } from "../Timestamp";
import BigNumber from "bignumber.js";

/**
 * Response when the client sends the node TokenGetInfoQuery.
 */
export interface TokenInfo {
    /**
     * ID of the token instance
     */
    tokenId: TokenId;

    /**
     * The name of the token. It is a string of ASCII only characters
     */
    name: string;

    /**
     * The symbol of the token. It is a UTF-8 capitalized alphabetical string
     */
    symbol: string;

    /**
     * The number of decimal places a token is divisible by
     */
    decimals: number;

    /**
     * The total supply of tokens that are currently in circulation
     */
    totalSupply: BigNumber;

    /**
     * The ID of the account which is set as Treasury
     */
    treasury: AccountId;

    /**
     * The key which can perform update/delete operations on the token. If empty, the token can be perceived as
     * immutable (not being able to be updated/deleted)
     */
    adminKey: PublicKey | null;

    /**
     * The key which can grant or revoke KYC of an account for the token's transactions. If empty, KYC is not required,
     * and KYC grant or revoke operations are not possible.
     */
    kycKey: PublicKey | null;

    /**
     * The key which can freeze or unfreeze an account for token transactions. If empty, freezing is not possible
     */
    freezeKey: PublicKey | null;

    /**
     * The key which can wipe token balance of an account. If empty, wipe is not possible
     */
    wipeKey: PublicKey | null;

    /**
     * The key which can change the supply of a token. The key is used to sign Token Mint/Burn operations
     */
    supplyKey: PublicKey | null;

    /**
     * The default Freeze status (not applicable = null, frozen = false, or unfrozen = true) of Hedera accounts relative to this token.
     * FreezeNotApplicable is returned if Token Freeze Key is empty. Frozen is returned if Token Freeze Key is set and
     * defaultFreeze is set to true. Unfrozen is returned if Token Freeze Key is set and defaultFreeze is set to false
     *      FreezeNotApplicable = null;
     *      Frozen = false;
     *      Unfrozen = true;
     */
    defaultFreezeStatus: boolean | null;

    /**
     * The default KYC status (KycNotApplicable or Revoked) of Hedera accounts relative to this token. KycNotApplicable
     * is returned if KYC key is not set, otherwise Revoked
     *      KycNotApplicable = null;
     *      Granted = false;
     *      Revoked = true;
     */
    defaultKycStatus: boolean | null;

    /**
     * Specifies whether the token was deleted or not
     */
    isDeleted: boolean;

    /**
     * An account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval
     */
    autoRenewAccount: AccountId | null;

    /**
     * The interval at which the auto-renew account will be charged to extend the token's expiry
     */
    autoRenewPeriod: number;

    /**
     * The epoch second at which the token expire: will; if an auto-renew account and period are specified,
     * this is coerced to the current epoch second plus the autoRenewPeriod
     */
    expirationTime: Date | null;
}

/**
 * Get all the information about an token, including the balance.
 * This does not get the list of token records.
 */
export class TokenInfoQuery extends QueryBuilder<TokenInfo> {
    private readonly _builder: TokenGetInfoQuery;

    public constructor() {
        super();

        this._builder = new TokenGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setTokengetinfo(this._builder);
    }

    /**
     * The token ID for which information is requested.
     */
    public setTokenId(tokenId: TokenIdLike): this {
        this._builder.setToken(new TokenId(tokenId)._toProto());
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
        return TokenService.getTokenInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getTokengetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): TokenInfo {
        const info = response.getTokengetinfo()!.getTokeninfo()!;

        return {
            tokenId: TokenId._fromProto(info.getTokenid()!),
            name: info.getName()!,
            symbol: info.getSymbol()!,
            decimals: info.getDecimals()!,
            totalSupply: new BigNumber(info.getTotalsupply()!),
            treasury: AccountId._fromProto(info.getTreasury()!),
            adminKey: info.hasAdminkey() ? _fromProtoKey(info.getAdminkey()!) : null,
            kycKey: info.hasKyckey() ? _fromProtoKey(info.getKyckey()!) : null,
            freezeKey: info.hasFreezekey() ? _fromProtoKey(info.getFreezekey()!) : null,
            wipeKey: info.hasWipekey() ? _fromProtoKey(info.getWipekey()!) : null,
            supplyKey: info.hasSupplykey() ? _fromProtoKey(info.getSupplykey()!) : null,
            defaultFreezeStatus:
                info.getDefaultfreezestatus() === 0 ?
                    null :
                    info.getDefaultfreezestatus() === 1,
            defaultKycStatus:
                info.getDefaultkycstatus() === 0 ?
                    null :
                    info.getDefaultkycstatus() === 1,
            isDeleted: info.getDeleted()!,
            autoRenewAccount: info.hasAutorenewaccount() ?
                AccountId._fromProto(info.getAutorenewaccount()!) :
                null,
            autoRenewPeriod: info.getAutorenewperiod()!.getSeconds(),
            expirationTime: info.hasExpiry() ?
                timestampToDate(info.getExpiry()!) :
                null
        };
    }
}
