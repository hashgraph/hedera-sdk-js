import {QueryBuilder} from "../QueryBuilder";
import {FileService} from "../generated/FileService_pb_service";
import {grpc} from "@improbable-eng/grpc-web";
import {Query} from "../generated/Query_pb";
import {FileGetInfoQuery} from "../generated/FileGetInfo_pb";
import {QueryHeader} from "../generated/QueryHeader_pb";
import {BaseClient} from "../BaseClient";
import {Response} from "../generated/Response_pb";
import {getSdkKeys} from "../util";
import {Ed25519PublicKey} from "../Keys";
import {FileIdLike, fileIdToProto, fileIdToSdk} from "../types/FileId";
import {timestampToDate} from "../types/Timestamp";

export type FileInfo = {
    fileId: FileIdLike;
    size: number;
    expirationTime: Date | null;
    deleted: boolean;
    keys: Ed25519PublicKey[];
}

export class FileInfoQuery extends QueryBuilder<FileInfo> {
    private readonly builder: FileGetInfoQuery;

    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this.builder = new FileGetInfoQuery();
        this.builder.setHeader(header);
        this.inner.setFilegetinfo(this.builder);
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
        return FileService.getFileInfo;
    }

    protected mapResponse(response: Response): FileInfo {
        const fileInfo = response.getFilegetinfo()!.getFileinfo()!;

        return {
            fileId: fileIdToSdk(fileInfo.getFileid()!),
            size: fileInfo.getSize(),
            expirationTime: fileInfo.getExpirationtime() == null ? null : timestampToDate(fileInfo.getExpirationtime()!),
            deleted: fileInfo.getDeleted(),
            keys: getSdkKeys(fileInfo.getKeys()!)
        };
    }
}