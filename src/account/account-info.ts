import {QueryBuilder} from "../QueryBuilder";
import {CryptoGetInfoQuery} from "../generated/CryptoGetInfo_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {Query} from "../generated/Query_pb";
import {Response} from "../generated/Response_pb";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {BaseClient} from "../BaseClient";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {AccountId, Timestamp} from "../typedefs";
import {Key} from "../generated/BasicTypes_pb";
import {getProtoAccountId, getSdkAccountId} from "../util";
import {Hbar} from "../Hbar";

export class AccountInfoQuery extends QueryBuilder<AccountInfo> {
    private readonly builder: CryptoGetInfoQuery;

    constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new CryptoGetInfoQuery();
        this.builder.setHeader(header);
    }

    public setAccountId(accountId: AccountId): this {
        this.builder.setAccountid(getProtoAccountId(accountId));
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
            accountId: getSdkAccountId(accountInfo.getAccountid()!),
            contractAccountId: accountInfo.getContractaccountid() || undefined,
            isDeleted: accountInfo.getDeleted(),
            proxyAccountId: accountInfo.hasProxyaccountid()
                ? getSdkAccountId(accountInfo.getProxyaccountid()!)
                : undefined,
            proxyReceived: accountInfo.hasProxyaccountid()
                ? Hbar.fromTinybar(accountInfo.getProxyreceived())
                : undefined,
            key: accountInfo.getKey()!,
            balance: Hbar.fromTinybar(accountInfo.getBalance()),
            generateSendRecordThreshold: Hbar.fromTinybar(accountInfo.getGeneratesendrecordthreshold()),
            generateReceiveRecordThreshold: Hbar.fromTinybar(accountInfo.getGeneratereceiverecordthreshold()),
            receiverSigRequired: accountInfo.getReceiversigrequired(),
            expirationTime: get
        };
    }

}

export type AccountInfo = {
    accountId: AccountId;
    contractAccountId?: string;
    isDeleted: boolean;
    proxyAccountId?: AccountId;
    proxyReceived?: Hbar;
    key: Key,
    balance: Hbar,
    generateSendRecordThreshold: Hbar,
    generateReceiveRecordThreshold: Hbar,
    receiverSigRequired: boolean,
    expirationTime: Timestamp,
};

