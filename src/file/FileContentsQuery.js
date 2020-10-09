import Query, { QUERY_REGISTRY } from "../query/Query.js";
import FileId from "./FileId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IFileGetContentsQuery} proto.IFileGetContentsQuery
 * @typedef {import("@hashgraph/proto").IFileGetContentsResponse} proto.IFileGetContentsResponse
 * @typedef {import("@hashgraph/proto").IFileContents} proto.IFileContents
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<Uint8Array>}
 */
export default class FileContentsQuery extends Query {
    /**
     * @param {object} [props]
     * @param {FileId | string} [props.fileId]
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?FileId}
         * @private
         */
        this._fileId = null;
        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
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
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.file.getFileContent(request);
    }

    /**
     * @returns {?FileId}
     */
    get fileId() {
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
     * @override
     * @internal
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
     * @returns {Promise<Uint8Array>}
     */
    _mapResponse(response) {
        const fileContentsResponse = /** @type {proto.IFileGetContentsResponse} */ (response.fileGetContents);
        const fileConents = /** @type {proto.IFileContents} */ (fileContentsResponse.fileContents);
        const contents = /** @type {Uint8Array} */ (fileConents.contents);

        return Promise.resolve(contents);
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

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("fileGetContents", FileContentsQuery._fromProtobuf);
