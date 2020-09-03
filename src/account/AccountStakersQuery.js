import Query from "../Query";
import AccountId from "./AccountId";
import ProxyStaker from "./ProxyStaker";
import proto from "@hashgraph/proto";
import Channel from "../Channel";

/**
 * Get all the accounts that are proxy staking to this account.
 * For each of them, give the amount currently staked.
 *
 * This is not yet implemented, but will be in a future version of the API.
 *
 * @augments {Query<ProxyStaker[]>}
 */
export default class AccountStakersQuery extends Query {
    /**
     * @param {object} props
     * @param {(AccountId | string)=} props.accountId
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
    }

    /**
     * Set the account ID for which the stakers are being requested.
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
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getQueryMethod(channel) {
        return (query) => channel.crypto.getStakersByAccountID(query);
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
