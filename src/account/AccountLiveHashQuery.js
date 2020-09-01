import Query from "../Query";
import AccountId from "./AccountId";
import LiveHash from "./LiveHash";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<LiveHash>}
 */
export default class LiveHashQuery extends Query {
    /**
     * @param {object} properties
     * @param {AccountId | string} [properties.accountId]
     * @param {Uint8Array} [properties.hash]
     */
    constructor(properties) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;
        if (properties?.accountId != null) {
            this.setAccountId(properties?.accountId);
        }

        /**
         * @type {?Uint8Array}
         * @private
         */
        this._hash = null;
        if (properties?.hash != null) {
            this.setHash(properties?.hash);
        }
    }

    /**
     * The account to which the livehash is associated
     *
     * @param {AccountId | string} accountId
     * @returns {LiveHashQuery}
     */
    setAccountId(accountId) {
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @param {Uint8Array} hash
     * @returns {LiveHashQuery}
     */
    setHash(hash) {
        this._hash = hash;
        return this;
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {LiveHash}
     */
    _mapResponse(response) {
        // @ts-ignore
        return LiveHash._fromProtobuf(response.cryptoGetLiveHash.liveHash);
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            cryptoGetLiveHash: {
                header: queryHeader,
                accountID: this._accountId?._toProtobuf(),
                hash: this._hash,
            },
        };
    }
}
