import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {AccountId, ContractIdLike, FileIdLike} from "../typedefs";
import {ContractUpdateTransactionBody} from "../generated/ContractUpdate_pb";
import {PublicKey} from "../Keys";
import {
    dateToTimestamp,
    getProtoAccountId,
    getProtoContractId,
    getProtoFileId,
    getProtoTimestamp,
    newDuration
} from "../util";

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

    public setContractId(contractIdLike: ContractIdLike): this {
        this.body.setContractid(getProtoContractId(contractIdLike));
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

    public setFileId(fileIdLike: FileIdLike): this {
        this.body.setFileid(getProtoFileId(fileIdLike));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setExpirationTime(date: number | Date): this {
        this.body.setExpirationtime(getProtoTimestamp(dateToTimestamp(date)));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.updateContract;
    }
}
