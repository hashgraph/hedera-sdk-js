import { QueryBuilder } from "./QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { FileId } from "./file/FileId";
import { ContractId } from "./contract/ContractId";
import { AccountId } from "./account/AccountId";
import * as pb from "./generated/GetBySolidityID_pb";
import { EntityId } from "./GetByKeyQuery";
import { SmartContractService } from "./generated/SmartContractService_pb_service";

export class GetBySolidityIdQuery extends QueryBuilder<EntityId> {
    private readonly _builder: pb.GetBySolidityIDQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new pb.GetBySolidityIDQuery();
        this._builder.setHeader(header);
        this._inner.setGetbysolidityid(this._builder);
    }

    public setSolidityId(id: string): this {
        this._builder.setSolidityid(id);
        return this;
    }

    protected _doValidate(errors: string[]): void {
        // Do nothing
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getBySolidityID;
    }

    protected _mapResponse(response: Response): EntityId {
        const id = response.getGetbysolidityid()!;

        if (id.hasAccountid()) {
            return {
                type: "ACCOUNT",
                accountId: AccountId.fromProto(id.getAccountid()!)
            };
        } else if (id.hasContractid()) {
            return {
                type: "CONTRACT",
                contractId: ContractId.fromProto(id.getContractid()!)
            };
        } else if (id.hasFileid()) {
            return {
                type: "FILE",
                fileId: FileId.fromProto(id.getFileid()!)
            };
        }

        throw new Error("unreachable");
    }
}
