import Query from "../Query";
import AccountId from "./AccountId";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";

/**
 * @augments {Query<Hbar>}
 */
export default class AccountBalanceQuery extends Query {
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
     * Set the account ID for which the balance is being requested.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountBalanceQuery}
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
     * @returns {Hbar}
     */
    _mapResponse(response) {
        return Hbar.fromTinybars(response.cryptogetAccountBalance?.balance ?? 0);
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            cryptogetAccountBalance: {
                header: queryHeader,
                accountID: this._accountId?._toProtobuf(),
                contractID: null,
            },
        };
    }
}
