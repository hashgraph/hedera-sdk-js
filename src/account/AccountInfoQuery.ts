import {QueryBuilder} from "../QueryBuilder";
import {CryptoGetInfoQuery} from "../generated/CryptoGetInfo_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {Query} from "../generated/Query_pb";
import {Response} from "../generated/Response_pb";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {BaseClient} from "../BaseClient";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {Key} from "../generated/BasicTypes_pb";
import {Hbar} from "../Hbar";
import {AccountIdLike, accountIdToProto, accountIdToSdk} from "../types/AccountId";
import {timestampToMs} from "../types/Timestamp";

export type AccountInfo = {
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
};

export class AccountInfoQuery extends QueryBuilder<AccountInfo> {
    private readonly builder: CryptoGetInfoQuery;

    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new CryptoGetInfoQuery();
        this.builder.setHeader(header);
        this.inner.setCryptogetinfo(this.builder);
    }

    public setAccountId(accountId: AccountIdLike): this {
        this.builder.setAccountid(accountIdToProto(accountId));
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasAccountid()) {
            errors.push("`.setAccountId()` required");
        }
    }

    protected getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return CryptoService.getAccountInfo;
    }

    protected mapResponse(response: Response): AccountInfo {
        const accountInfo = response.getCryptogetinfo()!.getAccountinfo()!;

        return {
            accountId: accountIdToSdk(accountInfo.getAccountid()!),
            contractAccountId: accountInfo.getContractaccountid() || undefined,
            isDeleted: accountInfo.getDeleted(),
            key: accountInfo.getKey()!,
            balance: Hbar.fromTinybar(accountInfo.getBalance()),
            generateSendRecordThreshold: Hbar.fromTinybar(accountInfo.getGeneratesendrecordthreshold()),
            generateReceiveRecordThreshold: Hbar.fromTinybar(accountInfo.getGeneratereceiverecordthreshold()),
            receiverSigRequired: accountInfo.getReceiversigrequired(),
            expirationTime: new Date(timestampToMs(accountInfo.getExpirationtime()!)),
            autoRenewPeriodSeconds: accountInfo.getAutorenewperiod()!.getSeconds(),
        };
    }
}

