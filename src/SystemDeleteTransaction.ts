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

    public setId(id: ContractIdLike | FileIdLike): this {
        try {
            const fileId = normalizeEntityId("file", id as FileIdLike);
            this._body.setFileid(new FileId(fileId).toProto());
        } catch {
            const contractId = normalizeEntityId("contract", id as ContractIdLike);
            this._body.setContractid(new ContractId(contractId).toProto());
        }

        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasContractid() == null && !this._body.hasFileid()) {
            errors.push("SystemDelete must have an id set. Use `.setId()`");
        }
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return FileService.systemDelete;
    }
}
