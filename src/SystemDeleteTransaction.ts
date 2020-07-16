import { SingleTransactionBuilder } from "./TransactionBuilder";
import { SystemDeleteTransactionBody } from "./generated/SystemDelete_pb";
import { dateToTimestamp, timestampToProto } from "./Timestamp";
import { FileId, FileIdLike } from "./file/FileId";
import { ContractId, ContractIdLike } from "./contract/ContractId";
import { grpc } from "@improbable-eng/grpc-web";
import { FileService } from "./generated/FileService_pb_service";
import { Transaction } from "./generated/Transaction_pb";
import { TransactionResponse } from "./generated/TransactionResponse_pb";
import { normalizeEntityId } from "./util";

/**
 * Delete a file or smart contract - can only be done with a Hedera admin multisig. When it is
 * deleted, it immediately disappears from the system as seen by the user, but is still stored
 * internally until the expiration time, at which time it is truly and permanently deleted.
 * Until that time, it can be undeleted by the Hedera admin multisig. When a smart contract is
 * deleted, the cryptocurrency account within it continues to exist, and is not affected
 * by the expiration time here.
 */
export class SystemDeleteTransaction extends SingleTransactionBuilder {
    private readonly _body: SystemDeleteTransactionBody;

    public constructor() {
        super();
        this._body = new SystemDeleteTransactionBody();
        this.setExpirationTime(Date.now() + 7890000000);
        this._inner.setSystemdelete(this._body);
    }

    /**
     * The timestamp in seconds at which the "deleted" file should truly be permanently deleted.
     */
    public setExpirationTime(date: number | Date): this {
        this._body.setExpirationtime(timestampToProto(dateToTimestamp(date)));
        return this;
    }

    /**
     * @deprecated `.setId` is deprecated. Use `.setFileId` or `.setContractId` instead.
     */
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
     * The file ID of the file to delete, in the format used in transactions.
     */
    public setFileId(id: FileIdLike): this {
        this._body.setFileid(new FileId(id)._toProto());
        return this;
    }

    /**
     * The contract ID instance to delete, in the format used in transactions
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
