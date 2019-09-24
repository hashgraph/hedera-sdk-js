import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractID, FileID} from "../generated/BasicTypes_pb";
import {AccountId, ContractId, FileId} from "../typedefs";
import {ContractUpdateTransactionBody} from "../generated/ContractUpdate_pb";
import {PublicKey} from "../Keys";
import {getProtoAccountId, newDuration} from "../util";
import {Timestamp} from "../generated/Timestamp_pb";

export class ContractUpdateTransaction extends TransactionBuilder {
    private readonly body: ContractUpdateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractUpdateTransactionBody();
        this.inner.setContractupdateinstance(this.body);
    }

    protected doValidate(errors: string[]): void {
        if (!this.body.hasContractid()) {
            errors.push('ContractUpdateTransaction requires contract id to be set');
            return;
        }
    }

    public setContractId({ shard, realm, contract }: ContractId): this {
        const contractId = new ContractID();
        contractId.setShardnum(shard);
        contractId.setRealmnum(realm);
        contractId.setContractnum(contract);
        this.body.setContractid(contractId);
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this.body.setAdminkey(publicKey.toProtoKey());
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this.body.setProxyaccountid(getProtoAccountId(proxyAccountId));
        return this;
    }

    public setFileId({ shard, realm, file }: FileId): this {
        const fileId = new FileID();
        fileId.setShardnum(shard);
        fileId.setRealmnum(realm);
        fileId.setFilenum(file);
        this.body.setFileid(fileId);
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setExpirationTime(date: Date | { seconds: number; nanos: number }): this {
        const timestamp = new Timestamp();

        if (date instanceof Date) {
            timestamp.setSeconds(date.getSeconds());
            timestamp.setNanos(0);
        } else {
            timestamp.setSeconds(date.seconds);
            timestamp.setNanos(date.nanos);
        }

        this.body.setExpirationtime(timestamp);
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.updateContract;
    }
}
