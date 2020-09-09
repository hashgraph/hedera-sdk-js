import Query from "../Query";
import AccountId from "./AccountId";
import ContractId from "../contract/ContractId";
import proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import Channel from "../Channel";

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
     * @param {object} props
     * @param {AccountId | string} [props.accountId]
     * @param {ContractId | string} [props.contractId]
     */
    constructor(props = {}) {
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

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {AccountBalanceQuery}
     */
    static _fromProtobuf(query) {
        const balance = /** @type {proto.ICryptoGetAccountBalanceQuery} */ (query.cryptogetAccountBalance);

        return new AccountBalanceQuery({
            accountId:
                balance.accountID != null
                    ? AccountId._fromProtobuf(balance.accountID)
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
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return false;
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.crypto.cryptoGetBalance(query);
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
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            cryptogetAccountBalance: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                accountID: this._accountId?._toProtobuf(),
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
