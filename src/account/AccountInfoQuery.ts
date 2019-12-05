import { QueryBuilder } from "../QueryBuilder";
import { CryptoGetInfoQuery } from "../generated/CryptoGetInfo_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { CryptoService } from "../generated/CryptoService_pb_service";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Key } from "../generated/BasicTypes_pb";
import { Hbar } from "../Hbar";
import { AccountId, AccountIdLike } from "./AccountId";
import { timestampToMs } from "../Timestamp";

export interface AccountInfo {
    accountId: AccountIdLike;
    contractAccountId?: string;
    isDeleted: boolean;
    proxyAccountId?: AccountIdLike;
    proxyReceived?: Hbar;
    key: Key;
    balance: Hbar;
    generateSendRecordThreshold: Hbar;
    generateReceiveRecordThreshold: Hbar;
    receiverSigRequired: boolean;
    expirationTime: Date;
    autoRenewPeriodSeconds: number;
    // proxy accounts and claims aren't really implemented so we're ignoring those
}

export class AccountInfoQuery extends QueryBuilder<AccountInfo> {
    private readonly _builder: CryptoGetInfoQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new CryptoGetInfoQuery();
        this._builder.setHeader(header);
        this._inner.setCryptogetinfo(this._builder);
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
        return CryptoService.getAccountInfo;
    }

    protected _mapResponse(response: Response): AccountInfo {
        const accountInfo = response.getCryptogetinfo()!.getAccountinfo()!;
        const sendThreshold = Hbar.fromTinybar(accountInfo.getGeneratesendrecordthreshold());
        const receiveThreshold = Hbar.fromTinybar(accountInfo.getGeneratereceiverecordthreshold());

        return {
            accountId: AccountId.fromProto(accountInfo.getAccountid()!),
            contractAccountId: accountInfo.getContractaccountid(),
            isDeleted: accountInfo.getDeleted(),
            key: accountInfo.getKey()!,
            balance: Hbar.fromTinybar(accountInfo.getBalance()),
            generateSendRecordThreshold: sendThreshold,
            generateReceiveRecordThreshold: receiveThreshold,
            receiverSigRequired: accountInfo.getReceiversigrequired(),
            expirationTime: new Date(timestampToMs(accountInfo.getExpirationtime()!)),
            autoRenewPeriodSeconds: accountInfo.getAutorenewperiod()!.getSeconds()
        };
    }
}

