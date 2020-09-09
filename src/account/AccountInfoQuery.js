import Query from "../Query";
import AccountId from "./AccountId";
import AccountInfo from "./AccountInfo";
import proto from "@hashgraph/proto";
import Channel from "../Channel";

/**
 * @augments {Query<AccountInfo>}
 */
export default class AccountInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {AccountId | string} [properties.accountId]
     */
    constructor(properties) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;
        if (properties?.accountId != null) {
            this.setAccountId(properties?.accountId);
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
     * @override
     * @param {proto.IResponse} response
     * @returns {AccountInfo}
     */
    _mapResponse(response) {
        const info = /** @type {proto.ICryptoGetInfoResponse} */ (response.cryptoGetInfo);

        return AccountInfo._fromProtobuf(
            /** @type {proto.CryptoGetInfoResponse.IAccountInfo} */ (info.accountInfo)
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetInfo: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                accountID: this._accountId?._toProtobuf(),
            },
        };
    }
}
