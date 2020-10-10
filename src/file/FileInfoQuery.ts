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

/**
 * Response when the client sends the node FileGetInfoQuery.
 */
export interface FileInfo {
    /**
     * The file ID of the file for which information is requested.
     */
    fileId: FileId;

    /**
     * Number of bytes in contents.
     */
    size: number;

    /**
     * The current time at which this account is set to expire.
     */
    expirationTime: Date | null;

    /**
     * True if deleted but not yet expired.
     */
    isDeleted: boolean;

    /**
     * One of these keys must sign in order to modify or delete the file.
     */
    keys: PublicKey[];
}

/**
 * Get all of the information about a file, except for its contents. When a file expires, it no
 * longer exists, and there will be no info about it, and the fileInfo field will be blank.
 * If a transaction or smart contract deletes the file, but it has not yet expired, then the
 * fileInfo field will be non-empty, the deleted field will be true, its size will be 0, and
 * its contents will be empty. Note that each file has a FileID, but does not have a filename.
 */
export class FileInfoQuery extends QueryBuilder<FileInfo> {
    private readonly _builder: FileGetInfoQuery;

    public constructor() {
        super();

        this._builder = new FileGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setFilegetinfo(this._builder);
    }

    /**
     * The file ID of the file for which information is requested.
     */
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
