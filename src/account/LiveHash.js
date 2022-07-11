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

import AccountId from "./AccountId.js";
import Duration from "../Duration.js";
import KeyList from "../KeyList.js";
import HashgraphProto from "@hashgraph/proto";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class LiveHash {
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {Uint8Array} props.hash
     * @param {KeyList} props.keys
     * @param {Duration} props.duration
     */
    constructor(props) {
        /** @readonly */
        this.accountId = props.accountId;

        /** @readonly */
        this.hash = props.hash;

        /** @readonly */
        this.keys = props.keys;

        /** @readonly */
        this.duration = props.duration;

        Object.freeze(this);
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {LiveHash}
     */
    static fromBytes(bytes) {
        return LiveHash._fromProtobuf(
            HashgraphProto.proto.LiveHash.decode(bytes)
        );
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ILiveHash} liveHash
     * @returns {LiveHash}
     */
    static _fromProtobuf(liveHash) {
        const liveHash_ = /** @type {HashgraphProto.proto.ILiveHash} */ (
            liveHash
        );

        return new LiveHash({
            accountId: AccountId._fromProtobuf(
                /** @type {HashgraphProto.proto.IAccountID} */ (
                    liveHash_.accountId
                )
            ),
            hash: liveHash_.hash != null ? liveHash_.hash : new Uint8Array(),
            keys:
                liveHash_.keys != null
                    ? KeyList.__fromProtobufKeyList(liveHash_.keys)
                    : new KeyList(),
            duration: Duration._fromProtobuf(
                /** @type {HashgraphProto.proto.IDuration} */ (
                    liveHash_.duration
                )
            ),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ILiveHash}
     */
    _toProtobuf() {
        return {
            accountId: this.accountId._toProtobuf(),
            hash: this.hash,
            keys: this.keys._toProtobufKey().keyList,
            duration: this.duration._toProtobuf(),
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.LiveHash.encode(
            this._toProtobuf()
        ).finish();
    }
}
