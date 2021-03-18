import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 */

/**
 *
 * @augments {EntityId<proto.IScheduleID>}
 */

export default class ScheduleId {
    /**
     * @param {number | Long | import("../EntityIdHelper.js").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(props, realm, num) {
        const [shard_num, realm_num, schedule_num] = entity_id.constructor(
            props,
            realm,
            num
        );

        this.shard = shard_num;
        this.realm = realm_num;
        this.num = schedule_num;
    }

    /**
     * @param {string} text
     * @returns {ScheduleId}
     */
    static fromString(text) {
        return new ScheduleId(...entity_id.fromString(text));
    }

    /**
     * @internal
     * @param {proto.IScheduleID} id
     * @returns {ScheduleId}
     */
    static _fromProtobuf(id) {
        return new ScheduleId({
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.scheduleNum != null ? id.scheduleNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {ScheduleId}
     */
    static fromBytes(bytes) {
        return ScheduleId._fromProtobuf(proto.ScheduleID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {ScheduleId}
     */
    static fromSolidityAddress(address) {
        return new ScheduleId(...entity_id.fromSolidityAddress(address));
    }

    /**
     * @internal
     * @override
     * @returns {proto.ScheduleID}
     */
    _toProtobuf() {
        return {
            scheduleNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @override
     * @returns {string}
     */
    toString() {
        const checksum = entity_id._parseAddress(
            "",
            `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
        );
        return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}-${
            checksum.correctChecksum
        }`;
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.ScheduleID.encode(this._toProtobuf()).finish();
    }
}
