import {QueryBuilder} from "../QueryBuilder";
import {BaseClient} from "../BaseClient";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {FileGetContentsQuery} from "../generated/FileGetContents_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {Query} from "../generated/Query_pb";
import {Response} from "../generated/Response_pb";
import {FileService} from "../generated/FileService_pb_service";
import {FileIdLike, fileIdToProto, fileIdToSdk} from "../types/FileId";

export type FileContents = {
    fileId: FileIdLike;
    contents: Uint8Array | string;
}

export class FileContentsQuery extends QueryBuilder<FileContents> {
    private readonly builder: FileGetContentsQuery;

    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new FileGetContentsQuery();
        this.builder.setHeader(header);
        this.inner.setFilegetcontents(this.builder);
    }

    public setFileId(fileId: FileIdLike): this {
        this.builder.setFileid(fileIdToProto(fileId));
        return this;
    }

    protected doValidate(errors: string[]): void {
        if (!this.builder.hasFileid()) {
            errors.push(".setFileId() required");
        }
    }

    protected getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return FileService.getFileContent;
    }

    protected mapResponse(response: Response): FileContents {
        const fileConents = response.getFilegetcontents()!.getFilecontents()!;

        return {
            fileId: fileIdToSdk(fileConents.getFileid()!),
            contents: fileConents.getContents()
        };
    }
}