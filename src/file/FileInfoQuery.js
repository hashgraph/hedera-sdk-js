import Query, { QUERY_REGISTRY } from "../Query";
import FileId from "./FileId";
import FileInfo from "./FileInfo";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<FileInfo>}
 */
export default class FileInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {FileId | string} [properties.fileId]
     */
    constructor(properties) {
        super();

        /**
         * @type {?FileId}
         * @private
         */
        this._fileId = null;
        if (properties?.fileId != null) {
            this.setFileId(properties?.fileId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {FileInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.IFileGetInfoQuery} */ (query.fileGetInfo);

        return new FileInfoQuery({
            fileId:
                info.fileID != null
                    ? FileId._fromProtobuf(info.fileID)
                    : undefined,
        });
    }

    /**
     * @returns {?FileId}
     */
    getFileId() {
        return this._fileId;
    }

    /**
     * Set the file ID for which the info is being requested.
     *
     * @param {FileId | string} fileId
     * @returns {FileInfoQuery}
     */
    setFileId(fileId) {
        this._fileId =
            fileId instanceof FileId ? fileId : FileId.fromString(fileId);

        return this;
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        return /** @type {proto.IResponseHeader} */ (response.fileGetInfo
            ?.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {FileInfo}
     */
    _mapResponse(response) {
        const info = /** @type {proto.IFileGetInfoResponse} */ (response.fileGetInfo);

        return FileInfo._fromProtobuf(
            /** @type {proto.FileGetInfoResponse.IFileInfo} */ (info.fileInfo)
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            fileGetInfo: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                fileID: this._fileId?._toProtobuf(),
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("fileGetInfo", FileInfoQuery._fromProtobuf);
