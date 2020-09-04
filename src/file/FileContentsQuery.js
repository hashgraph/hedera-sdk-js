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
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            fileGetContents: {
                header: queryHeader,
                fileID: this._fileId?._toProtobuf(),
            },
        };
    }
}
