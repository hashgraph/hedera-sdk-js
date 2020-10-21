import Query, { QUERY_REGISTRY } from "../query/Query.js";
import AccountId from "./AccountId.js";
import ContractId from "../contract/ContractId.js";
import AccountBalance from "./AccountBalance.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ICryptoGetAccountBalanceQuery} proto.ICryptoGetAccountBalanceQuery
 * @typedef {import("@hashgraph/proto").ICryptoGetAccountBalanceResponse} proto.ICryptoGetAccountBalanceResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * Get the balance of a Hedera™ crypto-currency account.
 *
 * This returns only the balance, so its a smaller and faster reply
 * than AccountInfoQuery.
 *
 * This query is free.
 *
 * @augments {Query<AccountBalance>}
 */
export default class AccountBalanceQuery extends Query {
    /**
     * @param {object} [props]
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
        this._contractId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {AccountBalanceQuery}
     */
    static _fromProtobuf(query) {
        const balance = /** @type {proto.ICryptoGetAccountBalanceQuery} */ (query.cryptogetAccountBalance);

        return new AccountBalanceQuery({
            accountId:
                balance.accountID != null
                    ? AccountId._fromProtobuf(balance.accountID)
                    : undefined,
            contractId:
                balance.contractID != null
                    ? ContractId._fromProtobuf(balance.contractID)
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
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
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
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.cryptoGetBalance(request);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptogetAccountBalance = /** @type {proto.ICryptoGetAccountBalanceResponse} */ (response.cryptogetAccountBalance);
        return /** @type {proto.IResponseHeader} */ (cryptogetAccountBalance.header);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {Promise<AccountBalance>}
     */
    _mapResponse(response) {
        const cryptogetAccountBalance = /** @type {proto.ICryptoGetAccountBalanceResponse} */ (response.cryptogetAccountBalance);
        return Promise.resolve(
            AccountBalance._fromProtobuf(cryptogetAccountBalance)
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
            cryptogetAccountBalance: {
                header,
                accountID:
                    this._accountId != null
                        ? this._accountId._toProtobuf()
                        : null,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }
}

QUERY_REGISTRY.set(
    "cryptogetAccountBalance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountBalanceQuery._fromProtobuf
);
