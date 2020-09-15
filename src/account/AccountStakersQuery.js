import Query, { QUERY_REGISTRY } from "../Query";
import AccountId from "./AccountId";
import ProxyStaker from "./ProxyStaker";
import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

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
     * @internal
     * @param {proto.Query} query
     * @returns {AccountStakersQuery}
     */
    static _fromProtobuf(query) {
        const stakers = /** @type {proto.ICryptoGetStakersQuery} */ (query.cryptoGetProxyStakers);

        return new AccountStakersQuery({
            accountId:
                stakers.accountID != null
                    ? AccountId._fromProtobuf(stakers.accountID)
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
    _getMethod(channel) {
        return (query) => channel.crypto.getStakersByAccountID(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        return /** @type {proto.IResponseHeader} */ (response
            .cryptoGetProxyStakers?.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {ProxyStaker[]}
     */
    _mapResponse(response) {
        return (
            response.cryptoGetProxyStakers?.stakers?.proxyStaker ?? []
        ).map((staker) => ProxyStaker._fromProtobuf(staker));
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptoGetProxyStakers: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                accountID: this._accountId?._toProtobuf(),
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("cryptoGetProxyStakers", AccountStakersQuery._fromProtobuf);
