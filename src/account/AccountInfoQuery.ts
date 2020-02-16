import { QueryBuilder } from "../QueryBuilder";
import { CryptoGetInfoQuery } from "../generated/CryptoGetInfo_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import { timestampToMs } from "../Timestamp";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { PublicKey, _fromProtoKey } from "../crypto/PublicKey";
import { BaseClient } from "../BaseClient";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export interface AccountInfo {
    /**
     * The account ID for which this information applies.
     */
    accountId: AccountId;

    /**
     * The Contract Account ID comprising of both the contract instance and the cryptocurrency
     * account owned by the contract instance, in the format used by Solidity.
     */
    contractAccountId: string | null;

    /**
     * If true, then this account has been deleted, it will disappear when it expires, and
     * all transactions for it will fail except the transaction to extend its expiration date.
     */
    isDeleted: boolean;

    /**
     * The Account ID of the account to which this is proxy staked. If proxyAccountID is null,
     * or is an invalid account, or is an account that isn't a node, then this account is
     * automatically proxy staked to a node chosen by the network, but without earning payments.
     * If the proxyAccountID account refuses to accept proxy staking , or if it is not currently
     * running a node, then it will behave as if proxyAccountID was null.
     */
    proxyAccountId: AccountId | null;

    /**
     * The total number of tinybars proxy staked to this account.
     */
    proxyReceived: Hbar;

    /**
     * The key for the account, which must sign in order to transfer out, or to modify the account
     * in any way other than extending its expiration date.
     */
    key: PublicKey;

    /**
     * The current balance of account in tinybars.
     */
    balance: Hbar;

    /**
     * The threshold amount (in tinybars) for which an account record is created (and this account
     * charged for them) for any send/withdraw transaction.
     */
    generateSendRecordThreshold: Hbar;

    /**
     * The threshold amount (in tinybars) for which an account record is created
     * (and this account charged for them) for any transaction above this amount.
     */
    generateReceiveRecordThreshold: Hbar;

    /**
     * If true, no transaction can transfer to this account unless signed by this account's key.
     */
    isReceiverSignatureRequired: boolean;

    /**
     * The TimeStamp time at which this account is set to expire.
     */
    expirationTime: Date;

    /**
     * The duration for expiration time will extend every this many seconds. If there are
     * insufficient funds, then it extends as long as possible. If it is empty when it
     * expires, then it is deleted.
     */
    autoRenewPeriod: number;
}

/**
 * Get all the information about an account, including the balance.
 * This does not get the list of account records.
 */
export class AccountInfoQuery extends QueryBuilder<AccountInfo> {
    private readonly _builder: CryptoGetInfoQuery;

    public constructor() {
        super();

        this._builder = new CryptoGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setCryptogetinfo(this._builder);
    }

    /**
     * The account ID for which information is requested.
     */
    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(accountId)._toProto());
        return this;
    }

    /**
     * Wrapper around `QueryBuilder.getCost()`. This must exist because the cost returned
     * `QueryBuilder.getCost()` and therein the Hedera Network doesn't work for any
     * acocuntns that have been deleted. In that case we want the minimum
     * cost to be ~25 Tinybar as this seems to succeed most of the time.
     */
    public async getCost(client: BaseClient): Promise<Hbar> {
        // deleted accounts return a COST_ANSWER of zero which triggers `INSUFFICIENT_TX_FEE`
        // if you set that as the query payment; 25 tinybar seems to be enough to get
        // `ACCOUNT_DELETED` back instead.
        const min = Hbar.fromTinybar(25);
        const cost = await super.getCost(client);
        return cost.isGreaterThan(min) ? cost : min;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getAccountInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getCryptogetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): AccountInfo {
        const accountInfo = response.getCryptogetinfo()!.getAccountinfo()!;
        const sendThreshold = Hbar.fromTinybar(accountInfo.getGeneratesendrecordthreshold());
        const receiveThreshold = Hbar.fromTinybar(accountInfo.getGeneratereceiverecordthreshold());

        return {
            accountId: AccountId._fromProto(accountInfo.getAccountid()!),
            contractAccountId: accountInfo.getContractaccountid(),
            isDeleted: accountInfo.getDeleted(),
            key: _fromProtoKey(accountInfo.getKey()!),
            balance: Hbar.fromTinybar(accountInfo.getBalance()),
            generateSendRecordThreshold: sendThreshold,
            generateReceiveRecordThreshold: receiveThreshold,
            isReceiverSignatureRequired: accountInfo.getReceiversigrequired(),
            expirationTime: new Date(timestampToMs(accountInfo.getExpirationtime()!)),
            autoRenewPeriod: accountInfo.getAutorenewperiod()!.getSeconds(),

            proxyAccountId: accountInfo.hasProxyaccountid() ?
                AccountId._fromProto(accountInfo.getProxyaccountid()!) :
                null,

            proxyReceived: Hbar.fromTinybar(accountInfo.getProxyreceived())
        };
    }
}

