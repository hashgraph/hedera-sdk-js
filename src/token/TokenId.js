import * as entity_id from "../EntityIdHelper.js";
import * as proto from "@hashgraph/proto";

/**
 * @typedef {import("long").Long} Long
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * The ID for a crypto-currency token on Hedera.
 */
export default class TokenId {
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
     * @returns {TokenId}
     */
    static fromString(text) {
        const result = entity_id.fromString(text);
        const id = new TokenId(result);
        id._checksum = result.checksum;
        return id;
    }

    /**
     * @internal
     * @param {proto.ITokenID} id
     * @param {(string | null)=} ledgerId
     * @returns {TokenId}
     */
    static _fromProtobuf(id, ledgerId) {
        const tokenId = new TokenId(
            id.shardNum != null ? id.shardNum : 0,
            id.realmNum != null ? id.realmNum : 0,
            id.tokenNum != null ? id.tokenNum : 0
        );

        if (ledgerId != null) {
            tokenId._setNetwork(ledgerId);
        }

        return tokenId;
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
     * @returns {TokenId}
     */
    static fromBytes(bytes) {
        return TokenId._fromProtobuf(proto.TokenID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {TokenId}
     */
    static fromSolidityAddress(address) {
        return new TokenId(...entity_id.fromSolidityAddress(address));
    }

    /**
     * @internal
     * @override
     * @returns {proto.ITokenID}
     */
    _toProtobuf() {
        return {
            tokenNum: this.num,
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
        return proto.TokenID.encode(this._toProtobuf()).finish();
    }

    /**
     * @returns {TokenId}
     */
    clone() {
        const id = new TokenId(this);
        id._checksum = this._checksum;
        return id;
    }
}
