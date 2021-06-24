import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * The ID for a crypto-currency account on Hedera.
 */
export default class AccountId {
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
     * @returns {AccountId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        return new AccountId(
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
     * @returns {AccountId}
     */
    static withNetwork(props, realm, num, networkName) {
        return new AccountId(props, realm, num, networkName);
    }

    /**
     * @internal
     * @param {proto.IAccountID} id
     * @param {(string | null)=} networkName
     * @returns {AccountId}
     */
    static _fromProtobuf(id, networkName) {
        return new AccountId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.accountNum != null ? id.accountNum : 0,
            networkName
        );
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
        return new AccountId(
            this.shard,
            this.realm,
            this.num,
            this._networkName,
            this._checksum
        );
    }
}
