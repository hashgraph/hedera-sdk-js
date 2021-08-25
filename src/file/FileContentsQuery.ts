import { QueryBuilder } from "../QueryBuilder";
import { QueryHeader } from "../generated/query_header_pb";
import { FileGetContentsQuery } from "../generated/file_get_contents_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/query_pb";
import { Response } from "../generated/response_pb";
import { FileService } from "../generated/file_service_pb_service";
import { FileId, FileIdLike } from "../file/FileId";
import { ResponseHeader } from "../generated/response_header_pb";

/**
 * Get the contents of a file. The content field is empty (no bytes) if the file is empty.
 */
export class FileContentsQuery extends QueryBuilder<Uint8Array> {
    private readonly _builder: FileGetContentsQuery;

    public constructor() {
        super();

        this._builder = new FileGetContentsQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setFilegetcontents(this._builder);
    }

    /**
     * The file ID of the file whose contents are requested.
     */
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

    protected _mapResponse(response: Response): Uint8Array {
        const fileConents = response.getFilegetcontents()!.getFilecontents()!;

        return fileConents.getContents_asU8();
    }
}
