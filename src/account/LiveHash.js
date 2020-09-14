import AccountId from "./AccountId";
import proto from "@hashgraph/proto";
import { _fromProtoKeyList, _toProtoKeyList } from "../util";
import { KeyList } from "@hashgraph/cryptography";
import Long from "long";

/**
 * Response when the client sends the node CryptoGetInfoQuery.
 */
export default class LiveHash {
    /**
     * @private
     * @param {object} props
     * @param {AccountId} props.accountId
     * @param {Uint8Array} props.hash
     * @param {KeyList} props.keys
     * @param {number} props.duration
     */
    constructor(props) {
        /** @readonly */
        this.accountId = props.accountId;

        /** @readonly */
        this.hash = props.hash;

        /** @readonly */
        this.keys = props.keys;

        /** @readonly */
        this.duration = props.duration;

        Object.freeze(this);
    }

    /**
     * @internal
     * @param {proto.ILiveHash} liveHash
     */
    static _fromProtobuf(liveHash) {
        const liveHash_ = /** @type {proto.LiveHash} */ (liveHash);
        const durationSeconds =
            liveHash_.duration != null
                ? liveHash_.duration.seconds != null
                    ? liveHash_.duration.seconds
                    : 0
                : 0;

        return new LiveHash({
            accountId: AccountId._fromProtobuf(
                /** @type {proto.IAccountID} */ (liveHash_.accountId)
            ),
            hash: liveHash_.hash != null ? liveHash_.hash : new Uint8Array(),
            keys:
                liveHash_.keys != null
                    ? _fromProtoKeyList(liveHash_.keys)
                    : new KeyList(),
            // TODO: util.fromLong could be nice
            duration:
                durationSeconds instanceof Long
                    ? durationSeconds.toInt()
                    : durationSeconds,
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
