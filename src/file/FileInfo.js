import FileId from "./FileId";
import Timestamp from "../Timestamp";
import proto from "@hashgraph/proto";
import { _fromProtoKeyList, _toProtoKeyList } from "../util";
import { KeyList } from "@hashgraph/cryptography";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class FileInfo {
    /**
     * @private
     * @param {object} properties
     * @param {FileId} properties.fileId
     * @param {number} properties.size
     * @param {Timestamp} properties.expirationTime
     * @param {boolean} properties.deleted
     * @param {KeyList} properties.keys
     */
    constructor(properties) {
        /**
         * The ID of the file for which information is requested.
         *
         * @readonly
         */
        this.fileId = properties.fileId;

        /**
         * Number of bytes in contents.
         *
         * @readonly
         */
        this.size = properties.size;

        /**
         * The current time at which this account is set to expire.
         *
         * @readonly
         */
        this.expirationTime = properties.expirationTime;

        /**
         * True if deleted but not yet expired.
         *
         * @readonly
         */
        this.deleted = properties.deleted;

        /**
         * One of these keys must sign in order to delete the file.
         * All of these keys must sign in order to update the file.
         *
         * @readonly
         */
        this.keys = properties.keys;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.FileGetInfoResponse.IFileInfo} info
     */
    static _fromProtobuf(info) {
        return new FileInfo({
            // @ts-ignore
            fileId: FileId._fromProtobuf(info.fileID),
            // @ts-ignore
            size: info.size,
            // @ts-ignore
            expirationTime: Timestamp._fromProtobuf(info.expirationTime),
            // @ts-ignore
            deleted: info.deleted,
            keys:
                info.keys != null
                    ? _fromProtoKeyList(info.keys)
                    : new KeyList(),
        });
    }

    /**
     * @internal
     * @returns {proto.FileGetInfoResponse.IFileInfo}
     */
    _toProtobuf() {
        return {
            fileID: this.fileId._toProtobuf(),
            size: this.size,
            expirationTime: this.expirationTime._toProtobuf(),
            deleted: this.deleted,
            keys: _toProtoKeyList(this.keys),
        };
    }
}
