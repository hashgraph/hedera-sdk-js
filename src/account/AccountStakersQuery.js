import Query from "../Query";
import AccountId from "./AccountId";
import ProxyStaker from "./ProxyStaker";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<ProxyStaker[]>}
 */
export default class AccountStakerQuery extends Query {
    /**
     * @param {object} properties
     * @param {(AccountId | string)=} properties.accountId
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
    }

    /**
     * Set the account ID for which the staker is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountStakerQuery}
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
     * @param {proto.IResponse} response
     * @returns {ProxyStaker[]}
     */
    _mapResponse(response) {
        // @ts-ignore
        return response.cryptoGetProxyStakers.stakers.proxyStaker.map(
            (staker) => ProxyStaker._fromProtobuf(staker)
        );
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            cryptoGetProxyStakers: {
                header: queryHeader,
                accountID: this._accountId?._toProtobuf(),
            },
        };
    }
}
