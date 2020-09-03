import Query from "../Query";
import AccountId from "./AccountId";
import ContractId from "../contract/ContractId";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";

/**
 * Get the balance of a Hedera™ crypto-currency account.
 *
 * This returns only the balance, so its a smaller and faster reply
 * than AccountInfoQuery.
 *
 * This query is free.
 *
 * @augments {Query<Hbar>}
 */
export default class AccountBalanceQuery extends Query {
    /**
     * @param {object} properties
     * @param {(AccountId | string)=} properties.accountId
     * @param {(ContractId | string)=} properties.contractId
     */
    constructor(properties) {
        super();

        /**
         * @type {?AccountId}
         * @private
         */
        this._accountId = null;

        /**
         * @type {?ContractId}
         * @private
         */

        if (properties?.accountId != null) {
            this.setAccountId(properties?.accountId);
        }

        if (properties?.contractId != null) {
            this.setContractId(properties?.contractId);
        }
    }

    /**
     * Set the account ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setContractId`.
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
     * Set the contract ID for which the balance is being requested.
     *
     * This is mutually exclusive with `setAccountId`.
     *
     * @param {ContractId | string} contractId
     * @returns {this}
     */
    setContractId(contractId) {
        this._contractId =
            contractId instanceof ContractId
                ? contractId
                : ContractId.fromString(contractId);

        return this;
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Hbar}
     */
    _mapResponse(response) {
        return Hbar.fromTinybars(
            response.cryptogetAccountBalance?.balance ?? 0
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
            cryptogetAccountBalance: {
                header: queryHeader,
                accountID: this._accountId?._toProtobuf(),
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
