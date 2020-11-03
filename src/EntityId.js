import Long from "long";
import * as hex from "./encoding/hex.js";

/**
 * @typedef {object} IEntityId
 * @property {number | Long} num
 * @property {(number | Long)=} shard
 * @property {(number | Long)=} realm
 */

/**
 * @abstract
 * @template T
 */
export default class EntityId {
    /**
     * @param {number | Long | IEntityId} props
     * @param {(number | null | Long)=} realm
     * @param {(number | null | Long)=} num
     */
    constructor(props, realm, num) {
        if (typeof props === "number" || props instanceof Long) {
            if (realm == null) {
                /**
                 * @readonly
                 * @type {Long}
                 */
                this.realm = Long.ZERO;

                /**
                 * @readonly
                 * @type {Long}
                 */
                this.shard = Long.ZERO;

                /**
                 * @readonly
                 * @type {Long}
                 */
                this.num = Long.fromValue(props);
            } else {
                this.shard = Long.fromValue(props);
                this.realm = Long.fromValue(realm);
                this.num = num != null ? Long.fromValue(num) : Long.ZERO;
            }
        } else {
            this.shard = Long.fromValue(props.shard != null ? props.shard : 0);
            this.realm = Long.fromValue(props.realm != null ? props.realm : 0);
            this.num = Long.fromValue(props.num != null ? props.num : 0);
        }
    }

    /**
     * @abstract
     * @internal
     * @returns {T}
     */
    _toProtobuf() {
        throw new Error("not implemented");
    }

    /**
     * @returns {string}
     */
    toSolidityAddress() {
        const buffer = new Uint8Array(20);

        buffer.set(this.shard.toBytesBE().slice(4, 8), 0);
        buffer.set(this.realm.toBytesBE(), 4);
        buffer.set(this.num.toBytesBE(), 12);

        return "0x" + hex.encode(buffer);
    }

    /**
     * @override
     */
    toString() {
        return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
    }

    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other) {
        return (
            this.shard.eq(other.shard) &&
            this.realm.eq(other.realm) &&
            this.num.eq(other.num)
        );
    }
}

/**
 * @param {string} text
 * @returns {[number, number, number]}
 */
export function fromString(text) {
    const components = text.split(".").map(Number);

    let shard = 0;
    let realm = 0;
    let num;

    if (components.length === 1) {
        num = components[0];
    } else if (components.length === 3) {
        shard = components[0];
        realm = components[1];
        num = components[2];
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
