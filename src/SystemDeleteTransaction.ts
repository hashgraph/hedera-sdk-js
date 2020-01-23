import { TransactionBuilder } from "./TransactionBuilder";
import { SystemDeleteTransactionBody } from "./generated/SystemDelete_pb";
import { dateToTimestamp, timestampToProto } from "./Timestamp";
import { FileId, FileIdLike } from "./file/FileId";
import { ContractId, ContractIdLike } from "./contract/ContractId";
import { grpc } from "@improbable-eng/grpc-web";
import { FileService } from "./generated/FileService_pb_service";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { normalizeEntityId } from "./util";

export class SystemDeleteTransaction extends TransactionBuilder {
    private readonly _body: SystemDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new SystemDeleteTransactionBody();
        this.setExpirationTime(Date.now() + 7890000000);
        this._inner.setSystemdelete(this._body);
    }

    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    public setId(id: FileIdLike | ContractIdLike): this {
        console.warn("`.setId` is deprecated. Use `.setFileId` or `.setContractId` instead");

        try {
            const fileId = normalizeEntityId("file", id as FileIdLike);
            this._body.setFileid(new FileId(fileId)._toProto());
        } catch {
            const contractId = normalizeEntityId("contract", id as ContractIdLike);
            this._body.setContractid(new ContractId(contractId)._toProto());
        }

        return this;
    }

    public setFileId(id: FileIdLike): this {
        this._body.setFileid(new FileId(id)._toProto());
        return this;
    }

    public setContractId(id: ContractIdLike): this {
        this._body.setContractid(new ContractId(id)._toProto());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid() == null && !this._body.hasFileid()) {
            errors.push("SystemDelete must have an id set. Use `.setFileId()` or `.setContractId()");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.systemDelete;
    }
}
