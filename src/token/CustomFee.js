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

import AccountId from "../account/AccountId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ICustomFee} HashgraphProto.proto.ICustomFee
 */

export default class CustomFee {
    /**
     * @param {object} props
     * @param {AccountId | string} [props.feeCollectorAccountId]
     */
    constructor(props = {}) {
        /**
         * @type {?AccountId}
         */
        this._feeCollectorAccountId = null;

        if (props.feeCollectorAccountId != null) {
            this.setFeeCollectorAccountId(props.feeCollectorAccountId);
        }
    }

    /**
     * @returns {?AccountId}
     */
    get feeCollectorAccountId() {
        return this._feeCollectorAccountId;
    }

    /**
     * @param {AccountId | string} feeCollectorAccountId
     * @returns {this}
     */
    setFeeCollectorAccountId(feeCollectorAccountId) {
        this._feeCollectorAccountId =
            typeof feeCollectorAccountId === "string"
                ? AccountId.fromString(feeCollectorAccountId)
                : feeCollectorAccountId;
        return this;
    }

    /**
     * @internal
     * @abstract
     * @param {HashgraphProto.proto.ICustomFee} info
     * @returns {CustomFee}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static _fromProtobuf(info) {
        throw new Error("not implemented");
    }

    /**
     * @internal
     * @abstract
     * @returns {HashgraphProto.proto.ICustomFee}
     */
    _toProtobuf() {
        throw new Error("not implemented");
    }
}
