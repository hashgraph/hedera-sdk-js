import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
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
     */
    constructor(props, realm, num) {
        const result = entity_id.constructor(props, realm, num);

        this.shard = result.shard;
        this.realm = result.realm;
        this.num = result.num;

        /**
         * @type {string | null}
         */
        this._checksum = null;
    }

    /**
     * @param {string} text
     * @returns {ScheduleId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new ScheduleId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {proto.IScheduleID} id
     * @param {(string | null)=} ledgerId
     * @returns {ScheduleId}
     */
    static _fromProtobuf(id, ledgerId) {
        const scheduleId = new ScheduleId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.scheduleNum != null ? id.scheduleNum : 0
        );

        if (ledgerId != null) {
            scheduleId._setNetwork(ledgerId);
        }

        return scheduleId;
    }

    /**
     * @internal
     * @param {Client} client
     */
    _setNetworkWith(client) {
        if (client._network._ledgerId != null) {
            this._setNetwork(client._network._ledgerId);
        }
    }

    /**
     * @internal
     * @param {string} ledgerId
     */
    _setNetwork(ledgerId) {
        this._checksum = entity_id._checksum(
            ledgerId,
            `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
        );
    }

    /**
     * @param {Client} client
     */
    validate(client) {
        if (
            client._network._ledgerId != null &&
            this._checksum != null &&
            this._checksum !=
                entity_id._checksum(
                    client._network._ledgerId,
                    `${this.shard.toString()}.${this.realm.toString()}.${this.num.toString()}`
                )
        ) {
            throw new Error("Entity ID is for a different network than client");
        }
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

    /**
     * @returns {ScheduleId}
     */
    clone() {
        const id = new ScheduleId(this);
        id._checksum = this._checksum;
        return id;
    }
}
