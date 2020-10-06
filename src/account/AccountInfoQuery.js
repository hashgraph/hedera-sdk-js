import Query, { QUERY_REGISTRY } from "../query/Query";
import AccountId from "./AccountId";
import AccountInfo from "./AccountInfo";
import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

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
     * @param {proto.Query} query
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
    getAccountId() {
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
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.getAccountInfo(query);
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
     * @protected
     * @override
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
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            cryptoGetInfo: {
                header,
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetInfo", AccountInfoQuery._fromProtobuf);
