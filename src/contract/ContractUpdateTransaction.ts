import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {ContractUpdateTransactionBody} from "../generated/ContractUpdate_pb";
import {PublicKey} from "../Keys";
import {
    dateToTimestamp,
    accountIdToProto,
    contractIdToProto,
    fileIdToProto,
    timestampToProto,
    newDuration
} from "../util";
import {ContractIdLike} from "../types/ContractId";
import {AccountId} from "../types/AccountId";
import {FileIdLike} from "../types/FileId";

export class ContractUpdateTransaction extends TransactionBuilder {
    private readonly body: ContractUpdateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractUpdateTransactionBody();
        this.inner.setContractupdateinstance(this.body);
    }

    protected doValidate(errors: string[]): void {
        if (!this.body.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this.body.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this.body.setAdminkey(publicKey.toProtoKey());
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this.body.setProxyaccountid(accountIdToProto(proxyAccountId));
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this.body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setExpirationTime(date: number | Date): this {
        this.body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.updateContract;
    }
}
