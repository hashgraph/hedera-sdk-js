/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2022 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import FileId from "./FileId.js";
import Timestamp from "../Timestamp.js";
import Long from "long";
import KeyList from "../KeyList.js";
import LedgerId from "../LedgerId.js";
import * as HashgraphProto from "@hashgraph/proto";

const { proto } = HashgraphProto;

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
     * @param {boolean} props.isDeleted
     * @param {KeyList} props.keys
     * @param {string} props.fileMemo
     * @param {LedgerId|null} props.ledgerId
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
        this.isDeleted = props.isDeleted;

        /**
         * One of these keys must sign in order to delete the file.
         * All of these keys must sign in order to update the file.
         *
         * @readonly
         */
        this.keys = props.keys;

        this.fileMemo = props.fileMemo;

        this.ledgerId = props.ledgerId;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.FileGetInfoResponse.IFileInfo} info
     * @returns {FileInfo}
     */
    static _fromProtobuf(info) {
        const size = /** @type {Long | number} */ (info.size);

        return new FileInfo({
            fileId: FileId._fromProtobuf(
                /** @type {HashgraphProto.proto.IFileID} */ (info.fileID)
            ),
            size: size instanceof Long ? size : Long.fromValue(size),
            expirationTime: Timestamp._fromProtobuf(
                /** @type {HashgraphProto.proto.ITimestamp} */ (
                    info.expirationTime
                )
            ),
            isDeleted: /** @type {boolean} */ (info.deleted),
            keys:
                info.keys != null
                    ? KeyList.__fromProtobufKeyList(info.keys)
                    : new KeyList(),
            fileMemo: info.memo != null ? info.memo : "",
            ledgerId:
                info.ledgerId != null
                    ? LedgerId.fromBytes(info.ledgerId)
                    : null,
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.FileGetInfoResponse.IFileInfo}
     */
    _toProtobuf() {
        return {
            fileID: this.fileId._toProtobuf(),
            size: this.size,
            expirationTime: this.expirationTime._toProtobuf(),
            deleted: this.isDeleted,
            keys: this.keys._toProtobufKey().keyList,
            memo: this.fileMemo,
            ledgerId: this.ledgerId != null ? this.ledgerId.toBytes() : null,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FileInfo}
     */
    static fromBytes(bytes) {
        return FileInfo._fromProtobuf(
            HashgraphProto.proto.FileGetInfoResponse.FileInfo.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.FileGetInfoResponse.FileInfo.encode(
            this._toProtobuf()
        ).finish();
    }
}
