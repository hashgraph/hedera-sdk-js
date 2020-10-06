import FileId from "./FileId";
import Timestamp from "../Timestamp";
import { KeyList } from "@hashgraph/cryptography";
import Long from "long";
import {
    keyListFromProtobuf,
    keyListToProtobuf,
} from "../cryptography/protobuf";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IFileInfo} proto.IFileInfo
 * @typedef {import("@hashgraph/proto").IFileID} proto.IFileID
 * @typedef {import("@hashgraph/proto").ITimestamp} proto.ITimestamp
 */

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class FileInfo {
    /**
     * @private
     * @param {object} props
     * @param {FileId} props.fileId
     * @param {Long} props.size
     * @param {Timestamp} props.expirationTime
     * @param {boolean} props.deleted
     * @param {KeyList} props.keys
     */
    constructor(props) {
        /**
         * The ID of the file for which information is requested.
         *
         * @readonly
         */
        this.fileId = props.fileId;

        /**
         * Number of bytes in contents.
         *
         * @readonly
         */
        this.size = props.size;

        /**
         * The current time at which this account is set to expire.
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         * True if deleted but not yet expired.
         *
         * @readonly
         */
        this.deleted = props.deleted;

        /**
         * One of these keys must sign in order to delete the file.
         * All of these keys must sign in order to update the file.
         *
         * @readonly
         */
        this.keys = props.keys;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.IFileInfo} info
     * @returns {FileInfo}
     */
    static _fromProtobuf(info) {
        const size = /** @type {Long | number} */ (info.size);

        return new FileInfo({
            fileId: FileId._fromProtobuf(
                /** @type {proto.IFileID} */ (info.fileID)
            ),
            size: size instanceof Long ? size : Long.fromValue(size),
            expirationTime: Timestamp._fromProtobuf(
                /** @type {proto.ITimestamp} */ (info.expirationTime)
            ),
            deleted: /** @type {boolean} */ (info.deleted),
            keys:
                info.keys != null
                    ? keyListFromProtobuf(info.keys)
                    : new KeyList(),
        });
    }

    /**
     * @internal
     * @returns {proto.IFileInfo}
     */
    _toProtobuf() {
        return {
            fileID: this.fileId._toProtobuf(),
            size: this.size,
            expirationTime: this.expirationTime._toProtobuf(),
            deleted: this.deleted,
            keys: keyListToProtobuf(this.keys),
        };
    }
}
