import AccountId from "./AccountId";
import proto from "@hashgraph/proto";
import { _fromProtoKeyList, _toProtoKeyList } from "../util";
import { KeyList } from "@hashgraph/cryptography";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class LiveHash {
    /**
     * @private
     * @param {object} properties
     * @param {AccountId} properties.accountId
     * @param {Uint8Array} properties.hash
     * @param {KeyList} properties.keys
     * @param {number} properties.duration
     */
    constructor(properties) {
        /** @readonly */
        this.accountId = properties.accountId;
        /** @readonly */
        this.hash = properties.hash;
        /** @readonly */
        this.keys = properties.keys;
        /** @readonly */
        this.duration = properties.duration;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ILiveHash} liveHash
     */
    static _fromProtobuf(liveHash) {
        return new LiveHash({
            // @ts-ignore
            accountId: AccountId._fromProtobuf(liveHash.accountId),
            // @ts-ignore
            hash: liveHash.hash,
            keys:
                liveHash?.keys != null
                    ? new KeyList().push(..._fromProtoKeyList(liveHash?.keys))
                    : new KeyList(),
            // @ts-ignore
            duration: liveHash.duration,
        });
    }

    /**
     * @internal
     * @returns {proto.ILiveHash}
     */
    _toProtobuf() {
        return {
            accountId: this.accountId._toProtobuf(),
            hash: this.hash,
            keys: _toProtoKeyList(this.keys),
            duration: {
                seconds: this.duration,
            },
        };
    }
}
