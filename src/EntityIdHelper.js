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

import Long from "long";
import * as hex from "./encoding/hex.js";
import BadEntityIdError from "./BadEntityIdError.js";
import * as util from "./util.js";

/**
 * @typedef {import("./client/Client.js").default<*, *>} Client
 */

/**
 * @typedef {object} IEntityId
 * @property {number | Long} num
 * @property {(number | Long)=} shard
 * @property {(number | Long)=} realm
 */

/**
 * @typedef {object} IEntityIdResult
 * @property {Long} shard
 * @property {Long} realm
 * @property {Long} num
 */

/**
 * @typedef {object} IEntityIdParts
 * @property {string?} shard
 * @property {string?} realm
 * @property {string} numOrHex
 * @property {string?} checksum
 */

/**
 * @typedef {object} IEntityIdResultWithChecksum
 * @property {Long} shard
 * @property {Long} realm
 * @property {Long} num
 * @property {string | null} checksum
 */

const regex =
    /"^(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))(?:-([a-z]{5}))?$/;

/**
 * This regex supports entity IDs
 *  - as stand alone nubmers
 *  - as shard.realm.num
 *  - as shard.realm.hex
 *  - can optionally provide checksum for any of the above
 */
const ENTITY_ID_REGEX = /^(\d+)(?:\.(\d+)\.([a-fA-F0-9]+))?(?:-([a-z]{5}))?$/;

/**
 * This method is called by most entity ID constructors. It's purpose is to
 * deduplicate the constuctors.
 *
 * @param {number | Long | IEntityId} props
 * @param {(number | null | Long)=} realmOrNull
 * @param {(number | null | Long)=} numOrNull
 * @returns {IEntityIdResult}
 */
export function constructor(props, realmOrNull, numOrNull) {
    // Make sure either both the second and third parameter are
    // set or not set; we shouldn't have one set, but the other not set.
    //
    //NOSONAR
    if (
        (realmOrNull == null && numOrNull != null) ||
        (realmOrNull != null && numOrNull == null)
    ) {
        throw new Error("invalid entity ID");
    }

    // If the first parameter is a nubmer then we need to conver the
    // first, second, and third parameters into numbers. Otherwise,
    // we should look at the fields `shard`, `realm`, and `num` on
    // `props`
    const [shard, realm, num] =
        typeof props === "number" || Long.isLong(props)
            ? [
                  numOrNull != null
                      ? Long.fromValue(/** @type {Long | number} */ (props))
                      : Long.ZERO,
                  realmOrNull != null ? Long.fromValue(realmOrNull) : Long.ZERO,
                  numOrNull != null
                      ? Long.fromValue(numOrNull)
                      : Long.fromValue(/** @type {Long | number} */ (props)),
              ]
            : [
                  props.shard != null ? Long.fromValue(props.shard) : Long.ZERO,
                  props.realm != null ? Long.fromValue(props.realm) : Long.ZERO,
                  Long.fromValue(props.num),
              ];

    // Make sure none of the numbers are negative
    if (shard.isNegative() || realm.isNegative() || num.isNegative()) {
        throw new Error("negative numbers are not allowed in IDs");
    }

    return {
        shard,
        realm,
        num,
    };
}

/**
 * A simple comparison function for comparing entity IDs
 *
 * @param {[Long, Long, Long]} a
 * @param {[Long, Long, Long]} b
 * @returns {number}
 */
export function compare(a, b) {
    let comparison = a[0].compare(b[0]);
    if (comparison != 0) {
        return comparison;
    }

    comparison = a[1].compare(b[1]);
    if (comparison != 0) {
        return comparison;
    }

    return a[2].compare(b[2]);
}

/**
 * This type is part of the entity ID checksums feature which
 * is responsible for checking if an entity ID was created on
 * the same ledger ID as the client is currently using.
 *
 * @typedef {object} ParseAddressResult
 * @property {number} status
 * @property {Long} [num1]
 * @property {Long} [num2]
 * @property {Long} [num3]
 * @property {string} [correctChecksum]
 * @property {string} [givenChecksum]
 * @property {string} [noChecksumFormat]
 * @property {string} [withChecksumFormat]
 */

/**
 * @param {string} text
 * @returns {IEntityIdParts}
 */
export function fromStringSplitter(text) {
    const match = ENTITY_ID_REGEX.exec(text);

    if (match == null) {
        throw new Error(`failed to parse entity id: ${text}`);
    }

    if (match[2] == null && match[3] == null) {
        return {
            shard: "0",
            realm: "0",
            numOrHex: match[1],
            checksum: match[4],
        };
    } else {
        return {
            shard: match[1],
            realm: match[2],
            numOrHex: match[3],
            checksum: match[4],
        };
    }
}

/**
 * @param {string} text
 * @returns {IEntityIdResultWithChecksum}
 */
export function fromString(text) {
    const result = fromStringSplitter(text);

    if (
        Number.isNaN(result.shard) ||
        Number.isNaN(result.realm) ||
        Number.isNaN(result.numOrHex)
    ) {
        throw new Error("invalid format for entity ID");
    }

    return {
        shard: result.shard != null ? Long.fromString(result.shard) : Long.ZERO,
        realm: result.realm != null ? Long.fromString(result.realm) : Long.ZERO,
        num: Long.fromString(result.numOrHex),
        checksum: result.checksum,
    };
}

/**
 * Return the shard, realm, and num from a solidity address.
 *
 * Solidity addresses are 20 bytes long and hex encoded, where the first 4
 * bytes represent the shard, the next 8 bytes represent the realm, and
 * the last 8 bytes represent the num. All in Big Endian format
 *
 * @param {string} address
 * @returns {[Long, Long, Long]}
 */
export function fromSolidityAddress(address) {
    const addr = address.startsWith("0x")
        ? hex.decode(address.slice(2))
        : hex.decode(address);

    if (addr.length !== 20) {
        throw new Error(`Invalid hex encoded solidity address length:
                expected length 40, got length ${address.length}`);
    }

    const shard = Long.fromBytesBE([0, 0, 0, 0, ...addr.slice(0, 4)]);
    const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
    const num = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

    return [shard, realm, num];
}

/**
 * Convert shard, realm, and num into a solidity address.
 *
 * See `fromSolidityAddress()` for more documentation.
 *
 * @param {[Long,Long,Long] | [number,number,number]} address
 * @returns {string}
 */
export function toSolidityAddress(address) {
    const buffer = new Uint8Array(20);
    const view = util.safeView(buffer);
    const [shard, realm, num] = address;

    view.setUint32(0, util.convertToNumber(shard));
    view.setUint32(8, util.convertToNumber(realm));
    view.setUint32(16, util.convertToNumber(num));

    return hex.encode(buffer);
}

/**
 * Parse the address string addr and return an object with the results (8 fields).
 * The first four fields are numbers, which could be implemented as signed 32 bit
 * integers, and the last four are strings.
 *
 *   status;  //the status of the parsed address
 *            //   0 = syntax error
 *            //   1 = an invalid with-checksum address (bad checksum)
 *            //   2 = a valid no-checksum address
 *            //   3 = a valid with-checksum address
 *   num1;    //the 3 numbers in the address, such as 1.2.3, with leading zeros removed
 *   num2;
 *   num3;
 *   correctchecksum;    //the correct checksum
 *   givenChecksum;      //the checksum in the address that was parsed
 *   noChecksumFormat;   //the address in no-checksum format
 *   withChecksumFormat; //the address in with-checksum format
 *
 * @param {Uint8Array} ledgerId
 * @param {string} addr
 * @returns {ParseAddressResult}
 */
export function _parseAddress(ledgerId, addr) {
    let match = regex.exec(addr);
    if (match === null) {
        let result = { status: 0 }; // When status == 0, the rest of the fields should be ignored
        return result;
    }
    let a = [
        Long.fromString(match[1]),
        Long.fromString(match[2]),
        Long.fromString(match[3]),
    ];
    let ad = `${a[0].toString()}.${a[1].toString()}.${a[2].toString()}`;
    let c = _checksum(ledgerId, ad);
    let s = match[4] === undefined ? 2 : c == match[4] ? 3 : 1; //NOSONAR
    return {
        status: s,
        num1: a[0],
        num2: a[1],
        num3: a[2],
        givenChecksum: match[4],
        correctChecksum: c,
        noChecksumFormat: ad,
        withChecksumFormat: `${ad}-${c}`,
    };
}

/**
 * Given an address like "0.0.123", return a checksum like "laujm"
 *
 * @param {Uint8Array} ledgerId
 * @param {string} addr
 * @returns {string}
 */
export function _checksum(ledgerId, addr) {
    let answer = "";
    let d = []; // Digits with 10 for ".", so if addr == "0.0.123" then d == [0, 10, 0, 10, 1, 2, 3]
    let s0 = 0; // Sum of even positions (mod 11)
    let s1 = 0; // Sum of odd positions (mod 11)
    let s = 0; // Weighted sum of all positions (mod p3)
    let sh = 0; // Hash of the ledger ID
    let c = 0; // The checksum, as a single number
    const p3 = 26 * 26 * 26; // 3 digits in base 26
    const p5 = 26 * 26 * 26 * 26 * 26; // 5 digits in base 26
    const ascii_a = "a".charCodeAt(0); // 97
    const m = 1000003; // Min prime greater than a million. Used for the final permutation.
    const w = 31; // Sum s of digit values weights them by powers of w. Should be coprime to p5.

    let h = new Uint8Array(ledgerId.length + 6);
    h.set(ledgerId, 0);
    h.set([0, 0, 0, 0, 0, 0], ledgerId.length);
    for (let i = 0; i < addr.length; i++) {
        //NOSONAR
        d.push(addr[i] === "." ? 10 : parseInt(addr[i], 10));
    }
    for (let i = 0; i < d.length; i++) {
        s = (w * s + d[i]) % p3;
        if (i % 2 === 0) {
            s0 = (s0 + d[i]) % 11;
        } else {
            s1 = (s1 + d[i]) % 11;
        }
    }
    for (let i = 0; i < h.length; i++) {
        sh = (w * sh + h[i]) % p5;
    }
    c = ((((addr.length % 5) * 11 + s0) * 11 + s1) * p3 + s + sh) % p5;
    c = (c * m) % p5;

    for (let i = 0; i < 5; i++) {
        answer = String.fromCharCode(ascii_a + (c % 26)) + answer;
        c /= 26;
    }

    return answer;
}

/**
 * Validate an entity ID checksum against a client
 *
 * @param {Long} shard
 * @param {Long} realm
 * @param {Long} num
 * @param {string | null} checksum
 * @param {Client} client
 */
export function validateChecksum(shard, realm, num, checksum, client) {
    if (client._network._ledgerId == null || checksum == null) {
        return;
    }

    const expectedChecksum = _checksum(
        client._network._ledgerId._ledgerId,
        `${shard.toString()}.${realm.toString()}.${num.toString()}`
    );

    if (checksum != expectedChecksum) {
        throw new BadEntityIdError(
            shard,
            realm,
            num,
            checksum,
            expectedChecksum
        );
    }
}

/**
 * Stringify the entity ID with a checksum.
 *
 * @param {string} string
 * @param {Client} client
 * @returns {string}
 */
export function toStringWithChecksum(string, client) {
    if (client._network._ledgerId == null) {
        throw new Error(
            "cannot calculate checksum with a client that does not contain a recognzied ledger ID"
        );
    }

    const checksum = _checksum(client._network._ledgerId._ledgerId, string);

    return `${string}-${checksum}`;
}
