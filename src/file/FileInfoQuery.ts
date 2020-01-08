import { QueryBuilder } from "../QueryBuilder";
import { FileService } from "../generated/FileService_pb_service";
import { grpc } from "@improbable-eng/grpc-web";
import { Query } from "../generated/Query_pb";
import { FileGetInfoQuery } from "../generated/FileGetInfo_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Response } from "../generated/Response_pb";
import { FileId, FileIdLike } from "../file/FileId";
import { timestampToDate } from "../Timestamp";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { BaseClient } from "../BaseClient";
import { Hbar } from "../Hbar";
import { PublicKey, _fromProtoKeyList } from "../crypto/PublicKey";

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

    public async getCost(client: BaseClient): Promise<Hbar> {
        // deleted files return a COST_ANSWER of zero which triggers `INSUFFICIENT_TX_FEE`
        // if you set that as the query payment; 25 tinybar seems to be the minimum to get
        // `FILE_DELETED` back instead.
        const min = Hbar.fromTinybar(25);
        const cost = await super.getCost(client);
        return cost.isGreaterThan(min) ? cost : min;
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

            expirationTime: fileInfo.hasExpirationtime() ?
                timestampToDate(fileInfo.getExpirationtime()!) :
                null,

            isDeleted: fileInfo.getDeleted(),
            keys: _fromProtoKeyList(fileInfo.getKeys()!)
        };
    }
}
