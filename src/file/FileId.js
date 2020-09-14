import EntityId, { fromString } from "../EntityId";
import proto from "@hashgraph/proto";
import Long from "long";
import * as hex from "../encoding/hex";

/**
 * The ID for a crypto-currency file on Hedera.
 *
 * @augments {EntityId<proto.IFileID>}
 */
export default class FileId extends EntityId {
    /**
     * @param {number | Long | import("../EntityId").IEntityId} properties
     * @param {(number | Long)=} realm
     * @param {(number | Long)=} num
     */
    constructor(properties, realm, num) {
        super(properties, realm, num);
    }

    /**
     * @param {string} text
     * @returns {FileId}
     */
    static fromString(text) {
        return new FileId(...fromString(text));
    }

    /**
     * @internal
     * @param {proto.IFileID} id
     * @returns {FileId}
     */
    static _fromProtobuf(id) {
        return new FileId({
            shard: id.shardNum != null ? id.shardNum : 0,
            realm: id.realmNum != null ? id.realmNum : 0,
            num: id.fileNum != null ? id.fileNum : 0,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {FileId}
     */
    static fromBytes(bytes) {
        return FileId._fromProtobuf(proto.FileID.decode(bytes));
    }

    /**
     * @param {string} address
     * @returns {FileId}
     */
    static fromSolidityAddress(address) {
        const addr = address.startsWith("0x")
            ? hex.decode(address.slice(2))
            : hex.decode(address);

        if (addr.length !== 20) {
            throw new Error(`Invalid hex encoded solidity address length:
                    expected length 40, got length ${address.length}`);
        }

        const shard = Long.fromBytesBE(Array.from(addr.slice(0, 4)));
        const realm = Long.fromBytesBE(Array.from(addr.slice(4, 12)));
        const file = Long.fromBytesBE(Array.from(addr.slice(12, 20)));

        return new FileId(shard, realm, file);
    }

    /**
     * @override
     * @internal
     * @returns {proto.IFileID}
     */
    _toProtobuf() {
        return {
            fileNum: this.num,
            shardNum: this.shard,
            realmNum: this.realm,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.FileID.encode(this._toProtobuf()).finish();
    }
}
