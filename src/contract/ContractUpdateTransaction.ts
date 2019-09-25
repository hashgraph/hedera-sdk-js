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
    private readonly _body: ContractUpdateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new ContractUpdateTransactionBody();
        this._inner.setContractupdateinstance(this._body);
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid()) {
            errors.push('ContractUpdateTransaction requires contract id to be set');
            return;
        }
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._body.setContractid(getProtoContractId(contractIdLike));
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this._body.setAdminkey(publicKey._toProtoKey());
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this._body.setProxyaccountid(getProtoAccountId(proxyAccountId));
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(getProtoFileId(fileIdLike));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(getProtoTimestamp(dateToTimestamp(date)));
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.updateContract;
    }
}
