import { QueryBuilder } from "./QueryBuilder";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "./generated/Query_pb";
import { Response } from "./generated/Response_pb";
import { QueryHeader } from "./generated/QueryHeader_pb";
import { FileId } from "./file/FileId";
import { ContractId } from "./contract/ContractId";
import { AccountId } from "./account/AccountId";
import * as pb from "./generated/GetByKey_pb";
import { PublicKey } from "./crypto/PublicKey";

export type EntityId =
    { type: "ACCOUNT"; accountId: AccountId } |
    { type: "CONTRACT"; contractId: ContractId } |
    { type: "FILE"; fileId: FileId };

export class GetByKeyQuery extends QueryBuilder<EntityId[]> {
    private readonly _builder: pb.GetByKeyQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new pb.GetByKeyQuery();
        this._builder.setHeader(header);
        this._inner.setGetbykey(this._builder);
    }

    public setKey(publicKey: PublicKey): this {
        this._builder.setKey(publicKey._toProtoKey());
        return this;
    }

    protected _doValidate(/* errors: string[] */): void {
        // Do nothing
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        throw new Error("not implemented; no service in Hedera exposes this method");
    }

    protected _mapResponse(response: Response): EntityId[] {
        return response.getGetbykey()!.getEntitiesList().filter((id) => id.hasContractid() ||
            id.hasAccountid() || id.hasFileid()).map((id) => {
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
        });
    }
}
