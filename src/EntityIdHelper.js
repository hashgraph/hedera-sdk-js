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
    if (typeof props === "number" || props instanceof Long) {
        if (realm == null) {
            return [
                /**
                 * @readonly
                 * @type {Long}
                 */
                Long.ZERO,

                /**
                 * @readonly
                 * @type {Long}
                 */
                Long.ZERO,

                /**
                 * @readonly
                 * @type {Long}
                 */
                (num = Long.fromValue(props)),
            ];
        } else {
            return [
                Long.fromValue(props),
                Long.fromValue(realm),
                num != null ? Long.fromValue(num) : Long.ZERO,
            ];
        }
    } else {
        return [
            Long.fromValue(props.shard != null ? props.shard : 0),
            Long.fromValue(props.realm != null ? props.realm : 0),
            Long.fromValue(props.num != null ? props.num : 0),
        ];
    }
}

/**
 * @param {string} text
 * @returns {[Long, Long, Long]}
 */
export function fromString(text) {
    const components = text.split(".").map(Number);

    let shard = Long.ZERO;
    let realm = Long.ZERO;
    let num;

    if (components.length === 1) {
        num = Long.fromValue(components[0]);
    } else if (components.length === 3) {
        shard = Long.fromValue(components[0]);
        realm = Long.fromValue(components[1]);
        num = Long.fromValue(components[2]);
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
