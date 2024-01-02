/*
 * Copyright (C) 2019-2023 Hedera Hashgraph, LLC
 *
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
 */

// HIP-32: https://hips.hedera.com/hip/hip-32
import { base32 } from "rfc4648";

const decodeOpts = { loose: true };
const encodeOpts = { pad: false };

/**
 * Decodes the rfc4648 base32 string into a {@link Uint8Array}. If the input string is null, returns null.
 * @param {string} str  the base32 string.
 * @returns {Uint8Array | ''}
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const decode = (str) => str && base32.parse(str, decodeOpts);

/**
 * Encodes the byte array into a rfc4648 base32 string without padding. If the input is null, returns null. Note with
 * the rfc4648 loose = true option, it allows lower case letters, padding, and auto corrects 0 -> O, 1 -> L, 8 -> B
 * @param {Buffer|Uint8Array} data
 * @returns {string}
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
const encode = (data) => data && base32.stringify(data, encodeOpts);

export default {
    decode,
    encode,
};
