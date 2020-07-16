import { SingleTransactionBuilder } from "./TransactionBuilder";
import { FileId, FileIdLike } from "./file/FileId";
import { ContractId, ContractIdLike } from "./contract/ContractId";
import { grpc } from "@improbable-eng/grpc-web";
import { FileService } from "./generated/FileService_pb_service";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { SystemUndeleteTransactionBody } from "./generated/SystemUndelete_pb";
import { normalizeEntityId } from "./util";

/**
 * Undelete a file or smart contract that was deleted by AdminDelete - can only be done with a
 * Hedera admin multisig. When it is deleted, it immediately disappears from the system as seen
 * by the user, but is still stored internally until the expiration time, at which time it is
 * truly and permanently deleted. Until that time, it can be undeleted by the Hedera admin
 * multisig. When a smart contract is deleted, the cryptocurrency account within it continues to
 * exist, and is not affected by the expiration time here.
 */
export class SystemUndeleteTransaction extends SingleTransactionBuilder {
    private readonly _body: SystemUndeleteTransactionBody;

    public constructor() {
        super();
        this._body = new SystemUndeleteTransactionBody();
        this._inner.setSystemundelete(this._body);
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

    /**
     * The file ID to undelete, in the format used in transactions.
     */
    public setFileId(id: FileIdLike): this {
        this._body.setFileid(new FileId(id)._toProto());
        return this;
    }

    /**
     * The contract ID instance to undelete, in the format used in transactions
     */
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
