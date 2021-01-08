import Long from "long";
import * as hex from "./encoding/hex.js";

/**
 * @typedef {object} IEntityId
 * @property {number | Long} num
 * @property {(number | Long)=} shard
 * @property {(number | Long)=} realm
 */

/**
 * @param {number | Long | IEntityId} props
 * @param {(number | null | Long)=} realm
 * @param {(number | null | Long)=} num
 * @returns {[Long, Long, Long]}
 */
export function constructor(props, realm, num) {
    let shard_ = Long.ZERO;
    let realm_ = Long.ZERO;
    let num_ = Long.ZERO;

    if (typeof props === "number" || props instanceof Long) {
        if (realm == null) {
            num_ = Long.fromValue(props);
        } else {
            shard_ = Long.fromValue(props);
            realm_ = Long.fromValue(realm);
            num_ = num != null ? Long.fromValue(num) : Long.ZERO;
        }
    } else {
        shard_ = Long.fromValue(props.shard != null ? props.shard : 0);
        realm_ = Long.fromValue(props.realm != null ? props.realm : 0);
        num_ = Long.fromValue(props.num != null ? props.num : 0);
    }

    if (shard_.isNegative() || realm_.isNegative() || num_.isNegative()) {
        throw new Error("negative numbers are not allowed in IDs");
    }

    return [shard_, realm_, num_];
}

/**
 * @param {string} text
 * @returns {[Long, Long, Long]}
 */
export function fromString(text) {
    const strings = text.split(".");

    for (const string of strings) {
        if (string === "") {
            throw new Error("invalid format for entity ID");
        }
    }

    const components = strings.map(Number);

    for (const component of components) {
        if (Number.isNaN(component)) {
            throw new Error("invalid format for entity ID");
        }
    }

    let shard = Long.ZERO;
    let realm = Long.ZERO;
    let num;

    if (components.length === 1) {
        num = Long.fromNumber(components[0]);
    } else if (components.length === 3) {
        shard = Long.fromNumber(components[0]);
        realm = Long.fromNumber(components[1]);
        num = Long.fromNumber(components[2]);
    } else {
        throw new Error("invalid format for entity ID");
    }

    return [shard, realm, num];
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
