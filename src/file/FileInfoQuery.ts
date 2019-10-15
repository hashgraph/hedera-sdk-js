import { QueryBuilder } from "../QueryBuilder";
import { FileService } from "../generated/FileService_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { FileGetInfoQuery } from "../generated/FileGetInfo_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { BaseClient } from "../BaseClient";
import { Response } from "../generated/Response_pb";
import { getSdkKeys } from "../util";
import { FileIdLike, fileIdToProto, fileIdToSdk } from "../file/FileId";
import { timestampToDate } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";

export type FileInfo = {
    fileId: FileIdLike;
    size: number;
    expirationTime: Date | null;
    deleted: boolean;
    keys: Ed25519PublicKey[];
}

export class FileInfoQuery extends QueryBuilder<FileInfo> {
    private readonly _builder: FileGetInfoQuery;

    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this._builder = new FileGetInfoQuery();
        this._builder.setHeader(header);
        this._inner.setFilegetinfo(this._builder);
    }

    public setFileId(fileId: FileIdLike): this {
        this._builder.setFileid(fileIdToProto(fileId));
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasFileid()) {
            errors.push(".setFileId() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return FileService.getFileInfo;
    }

    protected _mapResponse(response: Response): FileInfo {
        const fileInfo = response.getFilegetinfo()!.getFileinfo()!;

        return {
            fileId: fileIdToSdk(fileInfo.getFileid()!),
            size: fileInfo.getSize(),

            expirationTime: fileInfo.getExpirationtime() == null ?
                null :
                timestampToDate(fileInfo.getExpirationtime()!),

            deleted: fileInfo.getDeleted(),
            keys: getSdkKeys(fileInfo.getKeys()!)
        };
    }
}
