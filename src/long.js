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

import BigNumber from "bignumber.js";

/**
 * @typedef {{low: number, high: number, unsigned: boolean}} LongObject
 * @typedef {import("long")} Long
 */

/**
 * @param {Long | number | string | LongObject | BigNumber} value
 * @returns {BigNumber}
 */
export function valueToLong(value) {
    if (BigNumber.isBigNumber(value)) {
        return value;
    } else {
        return new BigNumber(value.toString());
    }
}
