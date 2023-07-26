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

export default class SemanticVersion {
    /**
     * @private
     * @param {object} props
     * @param {number} props.major
     * @param {number} props.minor
     * @param {number} props.patch
     */
    constructor(props) {
        /** @readonly */
        this.major = props.major;
        /** @readonly */
        this.minor = props.minor;
        /** @readonly */
        this.patch = props.patch;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ISemanticVersion} version
     * @returns {SemanticVersion}
     */
    static _fromProtobuf(version) {
        return new SemanticVersion({
            major: /** @type {number} */ (version.major),
            minor: /** @type {number} */ (version.minor),
            patch: /** @type {number} */ (version.patch),
        });
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.ISemanticVersion}
     */
    _toProtobuf() {
        return {
            major: this.major,
            minor: this.minor,
            patch: this.patch,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {SemanticVersion}
     */
    static fromBytes(bytes) {
        return SemanticVersion._fromProtobuf(
            HashgraphProto.proto.SemanticVersion.decode(bytes)
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.SemanticVersion.encode(
            this._toProtobuf()
        ).finish();
    }
}
