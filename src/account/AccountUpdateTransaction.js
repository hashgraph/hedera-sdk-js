import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import AccountId from "./AccountId.js";
import Timestamp from "../Timestamp.js";
import Duration from "../Duration.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoUpdateTransactionBody} proto.ICryptoUpdateTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Change properties for the given account.
 */
export default class AccountUpdateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {AccountId} [props.accountId]
     * @param {Key} [props.key]
     * @param {boolean} [props.receiverSignatureRequired]
     * @param {AccountId} [props.proxyAccountId]
     * @param {Duration | Long | number} [props.autoRenewPeriod]
     * @param {Timestamp | Date} [props.expirationTime]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        /**
         * @private
         * @type {?Key}
         */
        this._key = null;

        if (props.key != null) {
            this.setKey(props.key);
        }

        /**
         * @private
         * @type {boolean}
         */
        this._receiverSignatureRequired = false;

        if (props.receiverSignatureRequired != null) {
            this.setReceiverSignatureRequired(props.receiverSignatureRequired);
        }

        /**
         * @private
         * @type {?AccountId}
         */
        this._proxyAccountId = null;

        if (props.proxyAccountId != null) {
            this.setProxyAccountId(props.proxyAccountId);
        }

        /**
         * @private
         * @type {?Duration}
         */
        this._autoRenewPeriod = null;

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }

        /**
         * @private
         * @type {?Timestamp}
         */
        this._expirationTime = null;

        if (props.expirationTime != null) {
            this.setExpirationTime(props.expirationTime);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {AccountUpdateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const update = /** @type {proto.ICryptoUpdateTransactionBody} */ (body.cryptoUpdateAccount);

        return Transaction._fromProtobufTransactions(
            new AccountUpdateTransaction({
                accountId:
                    update.accountIDToUpdate != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (update.accountIDToUpdate)
                          )
                        : undefined,
                key:
                    update.key != null
                        ? keyFromProtobuf(update.key)
                        : undefined,
                receiverSignatureRequired:
                    update.receiverSigRequired != null
                        ? update.receiverSigRequired
                        : undefined,
                proxyAccountId:
                    update.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (update.proxyAccountID)
                          )
                        : undefined,
                autoRenewPeriod:
                    update.autoRenewPeriod != null
                        ? update.autoRenewPeriod.seconds != null
                            ? update.autoRenewPeriod.seconds
                            : undefined
                        : undefined,
                expirationTime:
                    update.expirationTime != null
                        ? Timestamp._fromProtobuf(update.expirationTime)
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
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * Sets the account ID which is being updated in this transaction.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountUpdateTransaction}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @returns {?Key}
     */
    get key() {
        return this._key;
    }

    /**
     * @param {Key} key
     * @returns {this}
     */
    setKey(key) {
        this._requireNotFrozen();
        this._key = key;

        return this;
    }

    /**
     * @returns {boolean}
     */
    get receiverSignatureRequired() {
        return this._receiverSignatureRequired;
    }

    /**
     * @param {boolean} receiverSignatureRequired
     * @returns {this}
     */
    setReceiverSignatureRequired(receiverSignatureRequired) {
        this._requireNotFrozen();
        this._receiverSignatureRequired = receiverSignatureRequired;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get proxyAccountId() {
        return this._proxyAccountId;
    }

    /**
     * @param {AccountId} proxyAccountId
     * @returns {this}
     */
    setProxyAccountId(proxyAccountId) {
        this._requireNotFrozen();
        this._proxyAccountId = proxyAccountId;

        return this;
    }

    /**
     * @returns {?Duration}
     */
    get autoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * @param {Duration | Long | number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Duration
                ? autoRenewPeriod
                : new Duration(autoRenewPeriod);

        return this;
    }

    /**
     * @returns {?Timestamp}
     */
    get expirationTime() {
        return this._expirationTime;
    }

    /**
     * @param {Timestamp | Date} expirationTime
     * @returns {this}
     */
    setExpirationTime(expirationTime) {
        this._requireNotFrozen();
        this._expirationTime =
            expirationTime instanceof Date
                ? Timestamp.fromDate(expirationTime)
                : expirationTime;

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.updateAccount(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoUpdateAccount";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoUpdateTransactionBody}
     */
    _makeTransactionData() {
        return {
            accountIDToUpdate:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            key: this._key != null ? keyToProtobuf(this._key) : null,
            expirationTime:
                this._expirationTime != null
                    ? this._expirationTime._toProtobuf()
                    : null,
            proxyAccountID:
                this._proxyAccountId != null
                    ? this._proxyAccountId._toProtobuf()
                    : null,
            autoRenewPeriod:
                this._autoRenewPeriod != null
                    ? this._autoRenewPeriod._toProtobuf()
                    : null,
            receiverSigRequiredWrapper:
                this._receiverSignatureRequired == null
                    ? null
                    : {
                          value: this._receiverSignatureRequired,
                      },
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoUpdateAccount",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountUpdateTransaction._fromProtobuf
);
