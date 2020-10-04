import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import AccountId from "./AccountId";
import { Key } from "@hashgraph/cryptography";
import { _fromProtoKey, _toProtoKey } from "../util";
import Long from "long";

export default class LiveHashDeleteTransaction extends Transaction {
    /**
     * @param {object} props
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
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.hash != null) {
            this.setHash(props.hash);
        }

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {LiveHashDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const hashes = /** @type {proto.ICryptoDeleteLiveHashTransactionBody} */ (body.cryptoDeleteLiveHash);

        return new LiveHashDeleteTransaction({
            hash:
                hashes.liveHashToDelete != null
                    ? hashes.liveHashToDelete
                    : undefined,
            accountId:
                hashes.accountOfLiveHash != null
                    ? AccountId._fromProtobuf(hashes.accountOfLiveHash)
                    : undefined,
        });
    }

    /**
     * @returns {?Uint8Array}
     */
    getHash() {
        return this._hash;
    }

    /**
     * @param {Uint8Array} hash
     * @returns {LiveHashDeleteTransaction}
     */
    setHash(hash) {
        this._requireNotFrozen();
        this.hash = hash;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    getAccountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {LiveHashDeleteTransaction}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this.accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.ITransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.crypto.deleteLiveHash(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "cryptoDeleteLiveHash";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoDeleteLiveHashTransactionBody}
     */
    _makeTransactionData() {
        return {
            liveHashToDelete: this._hash,
            accountOfLiveHash:
                this._accountId != null ? this._accountId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoDeleteLiveHash",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    LiveHashDeleteTransaction._fromProtobuf
);
