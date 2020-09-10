import Query from "../Query";
import AccountId from "./AccountId";
import LiveHash from "./LiveHash";
import proto from "@hashgraph/proto";
import Channel from "../Channel";

/**
 * @augments {Query<LiveHash>}
 */
export default class LiveHashQuery extends Query {
    /**
     * @param {object} props
     * @param {AccountId | string} [props.accountId]
     * @param {Uint8Array} [props.hash]
     */
    constructor(props = {}) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        /**
         * @type {?Uint8Array}
         * @private
         */
        this._hash = null;

        if (props.hash != null) {
            this.setHash(props.hash);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {LiveHashQuery}
     */
    static _fromProtobuf(query) {
        const hash = /** @type {proto.ICryptoGetLiveHashQuery} */ (query.cryptoGetLiveHash);

        return new LiveHashQuery({
            accountId:
                hash.accountID != null
                    ? AccountId._fromProtobuf(hash.accountID)
                    : undefined,
            hash: hash.hash ?? undefined,
        });
    }

    /**
     * @returns {?AccountId}
     */
    getAccountId() {
        return this._accountId;
    }

    /**
     * Set the account to which the livehash is associated.
     *
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    getLiveHash() {
        return this._hash;
    }

    /**
     * Set the SHA-384 data in the livehash.
     *
     * @param {Uint8Array} hash
     * @returns {this}
     */
    setHash(hash) {
        this._hash = hash;

        return this;
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.getLiveHash(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        return /** @type {proto.IResponseHeader} */ (response.cryptoGetLiveHash
            ?.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {LiveHash}
     */
    _mapResponse(response) {
        const hashes = /** @type {proto.ICryptoGetLiveHashResponse} */ (response.cryptoGetLiveHash);
        return LiveHash._fromProtobuf(
            /** @type {proto.ILiveHash} */ (hashes.liveHash)
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetLiveHash: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                accountID: this._accountId?._toProtobuf(),
                hash: this._hash,
            },
        };
    }
}
