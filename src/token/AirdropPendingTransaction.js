/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2024 Hedera Hashgraph, LLC
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

import Transaction from "../transaction/Transaction.js";

/**
 * @typedef {import("../token/PendingAirdropId.js").default} PendingAirdropId
 */
export default class AirdropPendingTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {PendingAirdropId[]} [props.pendingAirdropIds]
     */
    constructor(props) {
        /**
         * @private
         * @type {PendingAirdropId[]}
         */
        super();

        /**
         * @private
         * @type {PendingAirdropId[]}
         */
        this._pendingAirdropIds = [];

        if (props?.pendingAirdropIds != null) {
            this._pendingAirdropIds = props.pendingAirdropIds;
        }
    }

    /**
     * @returns {PendingAirdropId[]}
     */
    get pendingAirdropIds() {
        return this._pendingAirdropIds;
    }

    /**
     *
     * @param {PendingAirdropId} pendingAirdropId
     * @returns {this}
     */
    addPendingAirdropId(pendingAirdropId) {
        this._requireNotFrozen();
        this._pendingAirdropIds.push(pendingAirdropId);
        return this;
    }

    /**
     *
     * @param {PendingAirdropId[]} pendingAirdropIds
     * @returns {this}
     */
    setPendingAirdropIds(pendingAirdropIds) {
        this._requireNotFrozen();
        this._pendingAirdropIds = pendingAirdropIds;
        return this;
    }
}
