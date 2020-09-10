import Query from "../Query";
import FileId from "./FileId";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<Uint8Array>}
 */
export default class FileContentsQuery extends Query {
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
        return /** @type {proto.IResponseHeader} */ (response.fileGetContents
            ?.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Uint8Array}
     */
    _mapResponse(response) {
        return (
            response?.fileGetContents?.fileContents?.contents ??
            new Uint8Array()
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            fileGetContents: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                fileID: this._fileId?._toProtobuf(),
            },
        };
    }
}
