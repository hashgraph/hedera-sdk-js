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

/**
 * @type {string[]}
 */
const byteToHex = [];

for (let n = 0; n <= 0xff; n += 1) {
    byteToHex.push(n.toString(16).padStart(2, "0"));
}

/**
 * @param {Uint8Array} data
 * @returns {string}
 */
export function encode(data) {
    let string = "";

    for (const byte of data) {
        string += byteToHex[byte];
    }

    return string;
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decode(text) {
    const str = text.startsWith("0x") ? text.substring(2) : text;
    const result = str.match(/.{1,2}/gu);

    return new Uint8Array(
        (result == null ? [] : result).map((byte) => parseInt(byte, 16))
    );
}
