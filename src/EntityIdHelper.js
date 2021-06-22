import Long from "long";
import * as hex from "./encoding/hex.js";
import {
    _networkNameToLedgerId,
    _networkIds,
    _ledgerIdToNetworkName,
} from "./NetworkName.js";

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
 * @property {string | null} networkName
 * @property {string | null} checksum
 */

/**
 * @param {number | Long | IEntityId} props
 * @param {(number | null | Long)=} realmOrNetworkName
 * @param {(number | null | Long)=} numOrChecksum
 * @param {(string | null)=} networkName
 * @param {(string | null)=} checksum
 * @returns {IEntityIdResult}
 */
export function constructor(
    props,
    realmOrNetworkName,
    numOrChecksum,
    networkName,
    checksum
) {
    let shard_ = Long.ZERO;
    let realm_ = Long.ZERO;
    let num_ = Long.ZERO;

    let networkName_ =
        typeof realmOrNetworkName === "string"
            ? realmOrNetworkName
            : networkName;
    let checksum_ =
        typeof numOrChecksum === "string" ? numOrChecksum : checksum;

    if (typeof props === "number" || Long.isLong(props)) {
        if (
            realmOrNetworkName == null ||
            typeof realmOrNetworkName === "string"
        ) {
            num_ = Long.fromValue(props);
        } else {
            shard_ = Long.fromValue(props);
            realm_ = Long.fromValue(realmOrNetworkName);
            num_ =
                numOrChecksum != null
                    ? Long.fromValue(numOrChecksum)
                    : Long.ZERO;
        }
    } else {
        shard_ = Long.fromValue(props.shard != null ? props.shard : 0);
        realm_ = Long.fromValue(props.realm != null ? props.realm : 0);
        num_ = Long.fromValue(props.num != null ? props.num : 0);
    }

    if (shard_.isNegative() || realm_.isNegative() || num_.isNegative()) {
        throw new Error("negative numbers are not allowed in IDs");
    }

    const addr = `${shard_.toInt()}.${realm_.toInt()}.${num_.toInt()}`;

    if (networkName_ != null && checksum_ == null) {
        checksum_ = _checksum(_networkNameToLedgerId(networkName_), addr);
    } else if (networkName_ == null && checksum_ != null) {
        for (const network of _networkIds) {
            if (checksum_ == _checksum(network, addr)) {
                networkName_ = _ledgerIdToNetworkName(network);
                break;
            }
        }

        if (networkName_ == null) {
            throw new Error("Unrecognized network for entity ID checksum");
        }
    }

    return {
        shard: shard_,
        realm: realm_,
        num: num_,
        networkName: networkName_ != null ? networkName_ : null,
        checksum: checksum_ != null ? checksum_ : null,
    };
}

/**
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
 * @returns {IEntityIdResult}
 */
export function fromString(text) {
    if (!text.includes(".")) {
        text = `0.0.${text}`;
    }

    let result;
    let networkName = null;
    for (const network of _networkIds) {
        const address = _parseAddress(network, text);

        switch (address.status) {
            case 0: // Syntax error
                throw new Error(
                    "Invalid ID: format should look like 0.0.123 or 0.0.123-vfmkw"
                );
            case 1: // An invalid with-checksum address
                continue;
            case 2: // A valid no-checksum address
                result = address;
                result.correctChecksum = undefined;
                break;
            case 3: // A valid with-checksum address
                result = address;
                networkName = _ledgerIdToNetworkName(network);
                break;
        }
    }

    if (result == null) {
        throw new Error("Unrecognized network on entity ID");
    }

    if (result.num1 == null || result.num2 == null || result.num3 == null) {
        throw new Error(
            "(BUG) entity ID parseAddress incorrectly parsing address"
        );
    }

    return {
        shard: result.num1,
        realm: result.num2,
        num: result.num3,
        networkName,
        checksum:
            result.correctChecksum != null ? result.correctChecksum : null,
    };
}

/**
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

    const shard = Long.fromBytesBE(Array.from(addr.slice(0, 4)));
    const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
    const num = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

    return [shard, realm, num];
}

// /**
//  * Check that the checksum in box withChecksum is correct
//  *
//  * @param {number} status
//  */
// function _verify(status) {
//     switch (status) {
//         case 0: // Syntax error
//             throw new Error(
//                 "Invalid ID: format should look like 0.0.123 or 0.0.123-vfmkw"
//             );
//         case 1: // An invalid with-checksum address
//             throw new Error("Invalid ID: checksum does not match");
//         case 2: // A valid no-checksum address
//         case 3: // A valid with-checksum address
//             break;
//     }
// }

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
 * @param {string} ledgerId
 * @param {string} addr
 * @returns {ParseAddressResult}
 */
export function _parseAddress(ledgerId, addr) {
    const regex1 = RegExp(
        "^(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))\\.(0|(?:[1-9]\\d*))(?:-([a-z]{5}))?$"
    );
    let match = regex1.exec(addr);
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
    let s = match[4] === undefined ? 2 : c == match[4] ? 3 : 1; //the status
    let result = {
        status: s,
        num1: a[0],
        num2: a[1],
        num3: a[2],
        givenChecksum: match[4],
        correctChecksum: c,
        noChecksumFormat: ad,
        withChecksumFormat: `${ad}-${c}`,
    };
    return result;
}

/**
 * Given an address like "0.0.123", return a checksum like "laujm"
 *
 * @param {string} ledgerId
 * @param {string} addr
 * @returns {string}
 */
function _checksum(ledgerId, addr) {
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

    let id = ledgerId + "000000000000";
    let h = [];
    for (var i = 0; i < id.length; i += 2) {
        h.push(parseInt(id.substr(i, 2), 16));
    }
    for (let i = 0; i < addr.length; i++) {
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
