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

import utf8 from "utf8";
import * as hex from "./hex.native.js";

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function decode(data) {
    return utf8.decode(hex.encodeToByteString(data));
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function encode(text) {
    return hex.decodeFromByteString(utf8.encode(text));
}
