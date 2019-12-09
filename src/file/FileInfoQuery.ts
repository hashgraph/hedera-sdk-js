import { QueryBuilder } from "../QueryBuilder";
import { FileService } from "../generated/FileService_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { FileGetInfoQuery } from "../generated/FileGetInfo_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Response } from "../generated/Response_pb";
import { getSdkKeys } from "../util";
import { FileId, FileIdLike } from "../file/FileId";
import { timestampToDate } from "../Timestamp";
import { Ed25519PublicKey } from "../crypto/Ed25519PublicKey";

export interface FileInfo {
    fileId: FileIdLike;
    size: number;
    expirationTime: Date | null;
    deleted: boolean;
    keys: Ed25519PublicKey[];
}

export class FileInfoQuery extends QueryBuilder<FileInfo> {
    private readonly _builder: FileGetInfoQuery;

    public constructor() {
        const header = new QueryHeader();
        super(header);
        this._builder = new FileGetInfoQuery();
        this._builder.setHeader(header);
        this._inner.setFilegetinfo(this._builder);
    }

    public setFileId(fileId: FileIdLike): this {
        this._builder.setFileid(new FileId(fileId)._toProto());
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
            fileId: FileId._fromProto(fileInfo.getFileid()!),
            size: fileInfo.getSize(),

            expirationTime: fileInfo.getExpirationtime() == null ?
                null :
                timestampToDate(fileInfo.getExpirationtime()!),

            deleted: fileInfo.getDeleted(),
            keys: getSdkKeys(fileInfo.getKeys()!)
        };
    }
}
