import Long from "long";
import * as hex from "./encoding/hex";

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
     * @param {number | Long | IEntityId} properties
     * @param {(number | null | Long)=} realm
     * @param {(number | null | Long)=} num
     */
    constructor(properties, realm, num) {
        if (typeof properties === "number" || properties instanceof Long) {
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
                this.num = Long.fromValue(properties);
            } else {
                this.shard = Long.fromValue(properties);
                this.realm = Long.fromValue(realm);
                this.num = Long.fromValue(num != null ? num : 0);
            }
        } else {
            this.shard = Long.fromValue(
                properties.shard != null ? properties.shard : 0
            );
            this.realm = Long.fromValue(
                properties.realm != null ? properties.realm : 0
            );
            this.num = Long.fromValue(
                properties.num != null ? properties.num : 0
            );
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
