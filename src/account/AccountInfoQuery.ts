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

export interface AccountInfo {
    accountId: AccountId;
    contractAccountId: string | null;
    isDeleted: boolean;
    proxyAccountId: AccountId | null;
    proxyReceived: Hbar;
    key: PublicKey;
    balance: Hbar;
    generateSendRecordThreshold: Hbar;
    generateReceiveRecordThreshold: Hbar;
    isReceiverSignatureRequired: boolean;
    expirationTime: Date;
    autoRenewPeriod: number;
}

export class AccountInfoQuery extends QueryBuilder<AccountInfo> {
    private readonly _builder: CryptoGetInfoQuery;

    public constructor() {
        super();

        this._builder = new CryptoGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setCryptogetinfo(this._builder);
    }

    public setAccountId(accountId: AccountIdLike): this {
        this._builder.setAccountid(new AccountId(accountId)._toProto());
        return this;
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

