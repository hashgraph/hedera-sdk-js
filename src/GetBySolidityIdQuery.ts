import { QueryBuilder } from "./QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { FileId } from "./file/FileId";
import { ContractId } from "./contract/ContractId";
import { AccountId } from "./account/AccountId";
import * as pb from "./generated/GetBySolidityID_pb";
import { SmartContractService } from "./generated/SmartContractService_pb_service";
import { ResponseHeader } from "./generated/ResponseHeader_pb";

export type EntityId =
    { type: "ACCOUNT"; accountId: AccountId } |
    { type: "CONTRACT"; contractId: ContractId } |
    { type: "FILE"; fileId: FileId };

/**
 * Get the IDs in the format used by transactions, given the ID in the format used by Solidity.
 * If the Solidity ID is for a smart contract instance, then both the ContractID and
 * associated AccountID will be returned.
 */
export class GetBySolidityIdQuery extends QueryBuilder<EntityId> {
    private readonly _builder: pb.GetBySolidityIDQuery;

    public constructor() {
        super();

        this._builder = new pb.GetBySolidityIDQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setGetbysolidityid(this._builder);
    }

    /**
     * The ID in the format used by Solidity.
     */
    public setSolidityId(id: string): this {
        this._builder.setSolidityid(id);

        return this;
    }

    protected _doLocalValidate(/* errors: string[] */): void {
        // Nothing
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getBySolidityID;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getGetbysolidityid()!.getHeader()!;
    }

    protected _mapResponse(response: Response): EntityId {
        const id = response.getGetbysolidityid()!;

        if (id.hasAccountid()) {
            return {
                type: "ACCOUNT",
                accountId: AccountId._fromProto(id.getAccountid()!)
            };
        }

        if (id.hasContractid()) {
            return {
                type: "CONTRACT",
                contractId: ContractId._fromProto(id.getContractid()!)
            };
        }

        if (id.hasFileid()) {
            return {
                type: "FILE",
                fileId: FileId._fromProto(id.getFileid()!)
            };
        }

        throw new Error("unreachable");
    }
}
