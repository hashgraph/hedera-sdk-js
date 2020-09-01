import FileId from "./FileId";
import proto from "@hashgraph/proto";
import { _fromProtoKey } from "../util";
import { Key } from "@hashgraph/cryptography";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class FileInfo {
    /**
     * @private
     * @param {object} properties
     * @param {FileId} properties.fileId
     * @param {number} properties.size
     * @param {Date} properties.expirationTime
     * @param {boolean} properties.deleted
     * @param {Key[]} properties.keys
     */
    constructor(properties) {
        /**
         * The ID of the file for which information is requested.
         */
        this.fileId = properties.fileId;

        /**
         * Number of bytes in contents.
         */
        this.size = properties.size;

        /**
         * The current time at which this account is set to expire.
         */
        this.expirationTime = properties.expirationTime;

        /**
         * True if deleted but not yet expired.
         */
        this.deleted = properties.deleted;

        /**
         * One of these keys must sign in order to delete the file.
         * All of these keys must sign in order to update the file.
         */
        this.keys = properties.keys;

        Object.freeze(this);
    }

    /**
     * @param {proto.FileGetInfoResponse.IFileInfo} info
     */
    static _fromProtobuf(info) {
        return new FileInfo({
            // @ts-ignore
            fileId: FileId._fromProtobuf(info.fileID),
            // @ts-ignore
            size: info.size,
            // @ts-ignore
            expirationTime: new Date(info.expirationTime * 1000),
            // @ts-ignore
            deleted: info.deleted,
            keys: (info.keys?.keys ?? []).map((key) => _fromProtoKey(key)),
        });
    }
}
