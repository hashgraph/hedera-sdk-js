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

export default class BadEntityIdError extends Error {
    /**
     * @param {Long} shard
     * @param {Long} realm
     * @param {Long} num
     * @param {string} presentChecksum
     * @param {string} expectedChecksum
     */
    constructor(shard, realm, num, presentChecksum, expectedChecksum) {
        super(
            `Entity ID ${shard.toString()}.${realm.toString()}.${num.toString()}-${presentChecksum} was incorrect.`,
        );

        this.name = "BadEntityIdException";

        this.shard = shard;
        this.realm = realm;
        this.num = num;
        this.presentChecksum = presentChecksum;
        this.expectedChecksum = expectedChecksum;
    }
}
