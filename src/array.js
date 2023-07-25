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
 * A simple efficient function for comparing byte arrays
 *
 * @param {Uint8Array} array1
 * @param {Uint8Array} array2
 * @returns {boolean}
 */
export function arrayEqual(array1, array2) {
    if (array1 === array2) {
        return true;
    }

    if (array1.byteLength !== array2.byteLength) {
        return false;
    }

    const view1 = new DataView(
        array1.buffer,
        array1.byteOffset,
        array1.byteLength
    );
    const view2 = new DataView(
        array2.buffer,
        array2.byteOffset,
        array2.byteLength
    );

    let i = array1.byteLength;

    while (i--) {
        if (view1.getUint8(i) !== view2.getUint8(i)) {
            return false;
        }
    }

    return true;
}

/**
 * @param {Uint8Array} array
 * @param {Uint8Array} arrayPrefix
 * @returns {boolean}
 */
export function arrayStartsWith(array, arrayPrefix) {
    if (array.byteLength < arrayPrefix.byteLength) {
        return false;
    }

    let i = arrayPrefix.byteLength;

    while (i--) {
        if (array[i] !== arrayPrefix[i]) {
            return false;
        }
    }

    return true;
}
