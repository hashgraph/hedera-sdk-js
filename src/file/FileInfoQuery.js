import Query, { QUERY_REGISTRY } from "../query/Query";
import FileId from "./FileId";
import FileInfo from "./FileInfo";
import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

/**
 * @augments {Query<FileInfo>}
 */
export default class FileInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {FileId | string} [properties.fileId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @type {?FileId}
         * @private
         */
        this._fileId = null;
        if (properties.fileId != null) {
            this.setFileId(properties.fileId);
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
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.file.getFileInfo(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const fileGetInfo = /** @type {proto.IFileGetInfoResponse} */ (response.fileGetInfo);
        return /** @type {proto.IResponseHeader} */ (fileGetInfo.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<FileInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.IFileGetInfoResponse} */ (response.fileGetInfo);

        return Promise.resolve(
            FileInfo._fromProtobuf(
                /** @type {proto.IFileInfo} */ (info.fileInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            fileGetInfo: {
                header,
                fileID:
                    this._fileId != null ? this._fileId._toProtobuf() : null,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("fileGetInfo", FileInfoQuery._fromProtobuf);
