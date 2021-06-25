import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * The ID for a crypto-currency account on Hedera.
 */
export default class AccountId {
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
     * @returns {AccountId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new AccountId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {proto.IAccountID} id
     * @param {(string | null)=} ledgerId
     * @returns {AccountId}
     */
    static _fromProtobuf(id, ledgerId) {
        const accountId = new AccountId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.accountNum != null ? id.accountNum : 0
        );

        if (ledgerId != null) {
            accountId._setNetwork(ledgerId);
        }

        return accountId;
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
     * @returns {AccountId}
     */
    static fromBytes(bytes) {
        return AccountId._fromProtobuf(proto.AccountID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {AccountId}
     */
    static fromSolidityAddress(address) {
        return new AccountId(...entity_id.fromSolidityAddress(address));
    }

    /**
     * @internal
     * @override
     * @returns {proto.IAccountID}
     */
    _toProtobuf() {
        return {
            accountNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.AccountID.encode(this._toProtobuf()).finish();
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

    /**
     * @returns {AccountId}
     */
    clone() {
        const id = new AccountId(this);
        id._checksum = this._checksum;
        return id;
    }
}
