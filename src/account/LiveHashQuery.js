import Query, { QUERY_REGISTRY } from "../query/Query.js";
import AccountId from "./AccountId.js";
import LiveHash from "./LiveHash.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ICryptoGetLiveHashQuery} proto.ICryptoGetLiveHashQuery
 * @typedef {import("@hashgraph/proto").ICryptoGetLiveHashResponse} proto.ICryptoGetLiveHashResponse
 * @typedef {import("@hashgraph/proto").ILiveHash} proto.ILiveHash
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<LiveHash>}
 */
export default class LiveHashQuery extends Query {
    /**
     * @param {object} [props]
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
     * @param {proto.IQuery} query
     * @returns {LiveHashQuery}
     */
    static _fromProtobuf(query) {
        const hash = /** @type {proto.ICryptoGetLiveHashQuery} */ (query.cryptoGetLiveHash);

        return new LiveHashQuery({
            accountId:
                hash.accountID != null
                    ? AccountId._fromProtobuf(hash.accountID)
                    : undefined,
            hash: hash.hash != null ? hash.hash : undefined,
        });
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
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
    get liveHash() {
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
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptoGetLiveHash = /** @type {proto.ICryptoGetLiveHashResponse} */ (response.cryptoGetLiveHash);
        return /** @type {proto.IResponseHeader} */ (cryptoGetLiveHash.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<LiveHash>}
     */
    _mapResponse(response) {
        const hashes = /** @type {proto.ICryptoGetLiveHashResponse} */ (response.cryptoGetLiveHash);

        return Promise.resolve(
            LiveHash._fromProtobuf(
                /** @type {proto.ILiveHash} */ (hashes.liveHash)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            cryptoGetLiveHash: {
                header,
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
                hash: this._hash,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetLiveHash", LiveHashQuery._fromProtobuf);
