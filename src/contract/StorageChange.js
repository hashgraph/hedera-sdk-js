/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
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

import * as HashgraphProto from "@hashgraph/proto";

/**
 * @deprecated - Use mirror node for contract traceability instead
 */
export default class StorageChange {
    /**
     * @private
     * @param {object} props
     * @param {Uint8Array} props.slot
     * @param {Uint8Array} props.valueRead
     * @param {Uint8Array?} props.valueWritten
     */
    constructor(props) {
        this.slot = props.slot;
        this.valueRead = props.valueRead;
        this.valueWritten = props.valueWritten;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IStorageChange} change
     * @returns {StorageChange}
     */
    static _fromProtobuf(change) {
        // eslint-disable-next-line deprecation/deprecation
        return new StorageChange({
            slot: /** @type {Uint8Array} */ (change.slot),
            valueRead: /** @type {Uint8Array} */ (change.valueRead),
            valueWritten:
                change.valueWritten != null && change.valueWritten.value != null
                    ? change.valueWritten.value
                    : null,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {StorageChange}
     */
    static fromBytes(bytes) {
        // eslint-disable-next-line deprecation/deprecation
        return StorageChange._fromProtobuf(
            HashgraphProto.proto.StorageChange.decode(bytes)
        );
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IStorageChange}
     */
    _toProtobuf() {
        return {
            slot: this.slot,
            valueRead: this.valueRead,
            valueWritten:
                this.valueWritten != null ? { value: this.valueWritten } : null,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.StorageChange.encode(
            this._toProtobuf()
        ).finish();
    }
}
