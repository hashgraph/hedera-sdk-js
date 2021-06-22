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
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @param {(string | null)=} checksum
     */
    constructor(props, realm, num, networkName, checksum) {
        const result = entity_id.constructor(
            props,
            realm,
            num,
            networkName,
            checksum
        );

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;
        this._networkName = result.networkName;
        this._checksum = result.checksum;

        Object.freeze(this);
    }

    /**
     * @param {string} text
     * @returns {ScheduleId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        return new ScheduleId(
            result.shard,
            result.realm,
            result.num,
            result.networkName,
            result.checksum
        );
    }

    /**
     * @param {number | Long | import("../EntityIdHelper").IEntityId} props
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     * @param {(string | null)=} networkName
     * @returns {ScheduleId}
     */
    static withNetwork(props, realm, num, networkName) {
        return new ScheduleId(props, realm, num, networkName);
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
        if (this._checksum == null) {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`;
        } else {
            return `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}-${
                this._checksum
            }`;
        }
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.ScheduleID.encode(this._toProtobuf()).finish();
    }
}
