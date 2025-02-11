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

/**
 * Represents a handle for managing subscriptions to topics in the Hedera network.
 *
 * The `SubscriptionHandle` class provides methods to manage the lifecycle of a subscription,
 * including setting a callback function to be executed when an event occurs and unsubscribing
 * from the topic notifications. It is primarily used for handling real-time updates from the
 * Hedera network like topic subscriptions.
 */
export default class SubscriptionHandle {
    constructor() {
        /** @type {{(): void} | null} */
        this._call = null;

        /** @type {boolean} */
        this._unsubscribed = false;
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
            this._unsubscribed = true;
            this._call();
        }
    }
}
