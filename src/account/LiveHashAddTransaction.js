import Transaction, { TRANSACTION_REGISTRY } from "../transaction/Transaction";
import AccountId from "./AccountId";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoAddLiveHashTransactionBody} proto.ICryptoAddLiveHashTransactionBody
 * @typedef {import("@hashgraph/proto").ILiveHash} proto.ILiveHash
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel").default} Channel
 */

export default class LiveHashAddTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {Uint8Array} [props.hash]
     * @param {Key[]} [props.keys]
     * @param {number | Long} [props.duration]
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._hash = null;

        /**
         * @private
         * @type {?Key[]}
         */
        this._keys = null;

        /**
         * @private
         * @type {?Long}
         */
        this._duration = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.hash != null) {
            this.setHash(props.hash);
        }

        if (props.keys != null) {
            this.setKeys(props.keys);
        }

        if (props.duration != null) {
            this.setDuration(props.duration);
        }

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {LiveHashAddTransaction}
     */
    static _fromProtobuf(body) {
        const hashes = /** @type {proto.ICryptoAddLiveHashTransactionBody} */ (body.cryptoAddLiveHash);
        const liveHash_ = /** @type {proto.ILiveHash} */ (hashes.liveHash);

        return new LiveHashAddTransaction({
            hash: liveHash_.hash != null ? liveHash_.hash : undefined,
            keys:
                liveHash_.keys != null
                    ? liveHash_.keys.keys != null
                        ? liveHash_.keys.keys.map((key) => keyFromProtobuf(key))
                        : undefined
                    : undefined,
            duration:
                liveHash_.duration != null
                    ? liveHash_.duration.seconds != null
                        ? liveHash_.duration.seconds
                        : undefined
                    : undefined,
            accountId:
                liveHash_.accountId != null
                    ? AccountId._fromProtobuf(liveHash_.accountId)
                    : undefined,
        });
    }

    /**
     * @returns {?Uint8Array}
     */
    get hash() {
        return this._hash;
    }

    /**
     * @param {Uint8Array} hash
     * @returns {LiveHashAddTransaction}
     */
    setHash(hash) {
        this._requireNotFrozen();
        this._hash = hash;

        return this;
    }

    /**
     * @returns {?Key[]}
     */
    get keys() {
        return this._keys;
    }

    /**
     * @param {Key[]} keys
     * @returns {LiveHashAddTransaction}
     */
    setKeys(keys) {
        this._requireNotFrozen();
        this._keys = keys;

        return this;
    }

    /**
     * @returns {?Long}
     */
    get duration() {
        return this._duration;
    }

    /**
     * @param {number | Long} duration
     * @returns {LiveHashAddTransaction}
     */
    setDuration(duration) {
        this._requireNotFrozen();
        this._duration =
            duration instanceof Long ? duration : Long.fromValue(duration);

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {LiveHashAddTransaction}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.addLiveHash(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoAddLiveHash";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoAddLiveHashTransactionBody}
     */
    _makeTransactionData() {
        return {
            liveHash: {
                hash: this._hash,
                keys:
                    this._keys != null
                        ? {
                              keys: this._keys.map((key) => keyToProtobuf(key)),
                          }
                        : undefined,
                duration: {
                    seconds: this._duration,
                },
                accountId:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
            },
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoAddLiveHash",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    LiveHashAddTransaction._fromProtobuf
);
