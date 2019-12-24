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
import { PublicKey } from "../crypto/PublicKey";
import { ResponseHeader } from "../generated/ResponseHeader_pb";

export interface FileInfo {
    fileId: FileId;
    size: number;
    expirationTime: Date | null;
    isDeleted: boolean;
    keys: PublicKey[];
}

export class FileInfoQuery extends QueryBuilder<FileInfo> {
    private readonly _builder: FileGetInfoQuery;

    public constructor() {
        super();

        this._builder = new FileGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setFilegetinfo(this._builder);
    }

    public setFileId(fileId: FileIdLike): this {
        this._builder.setFileid(new FileId(fileId)._toProto());
        return this;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasFileid()) {
            errors.push(".setFileId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return FileService.getFileInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getFilegetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): FileInfo {
        const fileInfo = response.getFilegetinfo()!.getFileinfo()!;

        return {
            fileId: FileId._fromProto(fileInfo.getFileid()!),
            size: fileInfo.getSize(),

            expirationTime: fileInfo.getExpirationtime() == null ?
                null :
                timestampToDate(fileInfo.getExpirationtime()!),

            isDeleted: fileInfo.getDeleted(),
            keys: getSdkKeys(fileInfo.getKeys()!)
        };
    }
}
