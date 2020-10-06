import Query, { QUERY_REGISTRY } from "../query/Query";
import AccountId from "./AccountId";
import AccountInfo from "./AccountInfo";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IAccountInfo} proto.IAccountInfo
 * @typedef {import("@hashgraph/proto").ICryptoGetInfoQuery} proto.ICryptoGetInfoQuery
 * @typedef {import("@hashgraph/proto").ICryptoGetInfoResponse} proto.ICryptoGetInfoResponse
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 */

/**
 * @augments {Query<AccountInfo>}
 */
export default class AccountInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {AccountId | string} [properties.accountId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;
        if (properties.accountId != null) {
            this.setAccountId(properties.accountId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {AccountInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.ICryptoGetInfoQuery} */ (query.cryptoGetInfo);

        return new AccountInfoQuery({
            accountId:
                info.accountID != null
                    ? AccountId._fromProtobuf(info.accountID)
                    : undefined,
        });
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Set the account ID for which the info is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountInfoQuery}
     */
    setAccountId(accountId) {
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.getAccountInfo(request);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptoGetInfo = /** @type {proto.ICryptoGetInfoResponse} */ (response.cryptoGetInfo);
        return /** @type {proto.IResponseHeader} */ (cryptoGetInfo.header);
    }

    /**
     * @override
     * @protected
     * @param {proto.IResponse} response
     * @returns {Promise<AccountInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.ICryptoGetInfoResponse} */ (response.cryptoGetInfo);

        return Promise.resolve(
            AccountInfo._fromProtobuf(
                /** @type {proto.IAccountInfo} */ (info.accountInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetInfo: {
                header: this._makeRequestHeader(),
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetInfo", AccountInfoQuery._fromProtobuf);
