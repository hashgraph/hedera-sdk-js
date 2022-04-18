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

export default class SubscriptionHandle {
    constructor() {
        /** @type {{(): void} | null} */
        this._call = null;
    }

    /**
     * @param {() => void} call
     * @returns {void}
     */
    _setCall(call) {
        this._call = call;
    }

    unsubscribe() {
        if (this._call != null) {
            this._call();
        }
    }
}
