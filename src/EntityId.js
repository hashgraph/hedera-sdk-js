import Long from "long";

/**
 * @typedef {object} IEntityId
 * @property {number | Long} num
 * @property {(number | Long)=} shard
 * @property {(number | Long)=} realm
 */

/**
 * @abstract
 */
export default class EntityId {
    /**
     * @param {number | Long | IEntityId} properties
     * @param {(number | null | Long)=} realm
     * @param {(number | null | Long)=} num
     */
    constructor(properties, realm, num) {
        /** @readonly */
        this.shard;
        /** @readonly */
        this.realm;
        /** @readonly */
        this.num;

        if (typeof properties === "number" || properties instanceof Long) {
            if (realm == null) {
                this.realm = 0;
                this.shard = 0;
                this.num = Long.fromValue(properties).toNumber();
            } else {
                this.shard = Long.fromValue(properties).toNumber();
                this.realm = Long.fromValue(realm).toNumber();
                this.num = Long.fromValue(num ?? 0).toNumber();
            }
        } else {
            this.shard = Long.fromValue(properties.shard ?? 0).toNumber();
            this.realm = Long.fromValue(properties.realm ?? 0).toNumber();
            this.num = Long.fromValue(properties.num ?? 0).toNumber();
        }
    }

    /**
     * @override
     */
    toString() {
        return `${this.shard}.${this.realm}.${this.num}`;
    }

    /**
     * @param {this} other
     * @returns {boolean}
     */
    equals(other) {
        return (
            this.shard === other.shard &&
            this.realm === other.realm &&
            this.num === other.num
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
