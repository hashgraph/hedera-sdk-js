import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { FileGetContentsQuery } from "../generated/FileGetContents_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { Response } from "../generated/Response_pb";
import { FileService } from "../generated/FileService_pb_service";
import { FileId, FileIdLike } from "../file/FileId";
import { ResponseHeader } from "../generated/ResponseHeader_pb";

export interface FileContents {
    fileId: FileIdLike;
    contents: Uint8Array | string;
}

export class FileContentsQuery extends QueryBuilder<FileContents> {
    private readonly _builder: FileGetContentsQuery;

    public constructor() {
        super();

        this._builder = new FileGetContentsQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setFilegetcontents(this._builder);
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
        return FileService.getFileContent;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getFilegetcontents()!.getHeader()!;
    }

    protected _mapResponse(response: Response): FileContents {
        const fileConents = response.getFilegetcontents()!.getFilecontents()!;

        return {
            fileId: FileId._fromProto(fileConents.getFileid()!),
            contents: fileConents.getContents()
        };
    }
}
