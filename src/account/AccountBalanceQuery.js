import Query, { QUERY_REGISTRY } from "../Query";
import AccountId from "./AccountId";
import ContractId from "../contract/ContractId";
import * as proto from "@hashgraph/proto";
import Hbar from "../Hbar";
import Channel from "../channel/Channel";

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
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const cryptogetAccountBalance = /** @type {proto.ICryptoGetAccountBalanceResponse} */ (response.cryptogetAccountBalance);
        return /** @type {proto.IResponseHeader} */ (cryptogetAccountBalance.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<Hbar>}
     */
    _mapResponse(response) {
        const cryptogetAccountBalance = /** @type {proto.ICryptoGetAccountBalanceResponse} */ (response.cryptogetAccountBalance);
        return Promise.resolve(
            Hbar.fromTinybars(
                cryptogetAccountBalance.balance != null
                    ? cryptogetAccountBalance.balance
                    : 0
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
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountBalanceQuery._fromProtobuf
);
