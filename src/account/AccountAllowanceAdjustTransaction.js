import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
import TokenId from "../token/TokenId.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoAdjustAllowanceTransactionBody} proto.ICryptoAdjustAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Change properties for the given account.
 */
export default class AccountAllowanceAdjustTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TokenId} [props.tokenId]
     * @param {AccountId} [props.accountId]
     * @param {Long | number} [props.amount]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._amount = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        if (props.amount != null) {
            this.setAmount(props.amount);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceAdjustTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const allowanceAdjust =
            /** @type {proto.ICryptoAdjustAllowanceTransactionBody} */ (
                body.cryptoAdjustAllowance
            );

        return Transaction._fromProtobufTransactions(
            new AccountAllowanceAdjustTransaction({
                tokenId:
                    allowanceAdjust.token != null
                        ? TokenId._fromProtobuf(
                              /** @type {proto.ITokenID} */ (
                                  allowanceAdjust.token
                              )
                          )
                        : undefined,
                accountId:
                    allowanceAdjust.spender != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (
                                  allowanceAdjust.spender
                              )
                          )
                        : undefined,
                amount:
                    allowanceAdjust.amount != null
                        ? allowanceAdjust.amount
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * Sets the token ID which is being allowanceAdjustd in this transaction.
     *
     * @param {TokenId | string} tokenId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    setTokenId(tokenId) {
        this._requireNotFrozen();
        this._tokenId =
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : tokenId.clone();

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Sets the account ID which is being allowanceAdjustd in this transaction.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this._accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : accountId.clone();

        return this;
    }

    /**
     * @returns {?Long}
     */
    get amount() {
        return this._amount;
    }

    /**
     * Sets the account ID which is being allowanceAdjustd in this transaction.
     *
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    setAmount(amount) {
        this._requireNotFrozen();
        this._amount =
            typeof amount === "number" ? Long.fromNumber(amount) : amount;

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._tokenId != null) {
            this._tokenId.validateChecksum(client);
        }

        if (this._accountId != null) {
            this._accountId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.adjustAllowance(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoAdjustAllowance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoAdjustAllowanceTransactionBody}
     */
    _makeTransactionData() {
        return {
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            spender:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            amount: this._amount,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoAdjustAllowance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountAllowanceAdjustTransaction._fromProtobuf
);
