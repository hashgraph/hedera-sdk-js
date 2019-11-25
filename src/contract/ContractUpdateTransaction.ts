import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { SmartContractService } from "../generated/SmartContractService_pb_service";

import { ContractUpdateTransactionBody } from "../generated/ContractUpdate_pb";
import { newDuration } from "../util";
import { ContractIdLike, contractIdToProto } from "./ContractId";
import { AccountId, accountIdToProto } from "../account/AccountId";
import { FileIdLike, fileIdToProto } from "../file/FileId";
import { dateToTimestamp, timestampToProto } from "../Timestamp";
import { PublicKey } from "../crypto/PublicKey";

export class ContractUpdateTransaction extends TransactionBuilder {
    private readonly _body: ContractUpdateTransactionBody;

    public constructor() {
        super();
        this._body = new ContractUpdateTransactionBody();
        this._inner.setContractupdateinstance(this._body);
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._body.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this._body.setAdminkey(publicKey._toProtoKey());
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this._body.setProxyaccountid(accountIdToProto(proxyAccountId));
        return this;
    }

    public setFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.updateContract;
    }
}
