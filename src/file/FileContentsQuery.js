import Query, { QUERY_REGISTRY } from "../Query";
import FileId from "./FileId";
import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

/**
 * @augments {Query<Uint8Array>}
 */
export default class FileContentsQuery extends Query {
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
     * @returns {FileContentsQuery}
     */
    static _fromProtobuf(query) {
        const contents = /** @type {proto.IFileGetContentsQuery} */ (query.fileGetContents);

        return new FileContentsQuery({
            fileId:
                contents.fileID != null
                    ? FileId._fromProtobuf(contents.fileID)
                    : undefined,
        });
    }

    /**
     * @abstract
     * @protected
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.file.getFileContent(query);
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
     * @returns {FileContentsQuery}
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
        const fileGetContents = /** @type {proto.IFileGetContentsResponse} */ (response.fileGetContents);
        return /** @type {proto.IResponseHeader} */ (fileGetContents.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Uint8Array}
     */
    _mapResponse(response) {
        const fileContentsResponse = /** @type {proto.IFileGetContentsResponse} */ (response.fileGetContents);
        const fileConents = /** @type {proto.FileGetContentsResponse.IFileContents} */ (fileContentsResponse.fileContents);
        const contents = /** @type {Uint8Array} */ (fileConents.contents);
        return contents;
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            fileGetContents: {
                header,
                fileID:
                    this._fileId != null ? this._fileId._toProtobuf() : null,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("fileGetContents", FileContentsQuery._fromProtobuf);
