import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import AccountId from "./AccountId";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import { _toProtoKey } from "../util";

/**
 * Marks an account as deleted, moving all its current hbars to another account.
 *
 * It will remain in the ledger, marked as deleted, until it expires.
 * Transfers into it a deleted account fail. But a deleted account can still have its
 * expiration extended in the normal way.
 */
export default class AccountDeleteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {AccountId} [props.accountId]
     * @param {AccountId} [props.transferAccountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._transferAccountId = null;

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }

        if (props.transferAccountId != null) {
            this.setTransferAccountId(props.transferAccountId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {AccountDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const accountDelete = /** @type {proto.ICryptoDeleteTransactionBody} */ (body.cryptoDelete);

        return new AccountDeleteTransaction({
            accountId:
                accountDelete.deleteAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (accountDelete.deleteAccountID)
                      )
                    : undefined,
            transferAccountId:
                accountDelete.transferAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (accountDelete.transferAccountID)
                      )
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
     * Set the account ID which is being deleted in this transaction.
     *
     * @param {AccountId | string} accountId
     * @returns {AccountDeleteTransaction}
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
     * @returns {?AccountId}
     */
    getTransferAccountId() {
        return this._transferAccountId;
    }

    /**
     * Set the account ID which will receive all remaining hbars.
     *
     * @param {AccountId | string} transferAccountId
     * @returns {AccountDeleteTransaction}
     */
    setTransferAccountId(transferAccountId) {
        this._requireNotFrozen();
        this._transferAccountId =
            transferAccountId instanceof AccountId
                ? transferAccountId
                : AccountId.fromString(transferAccountId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.crypto.cryptoDelete(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "cryptoDelete";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoDeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            deleteAccountID:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            transferAccountID:
                this._transferAccountId != null
                    ? this._transferAccountId._toProtobuf()
                    : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoDelete",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountDeleteTransaction._fromProtobuf
);
