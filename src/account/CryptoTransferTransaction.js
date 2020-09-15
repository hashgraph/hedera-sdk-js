import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Hbar from "../Hbar";
import AccountId from "../account/AccountId";
import Transfer from "../Transfer";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import { _toProtoKey } from "../util";
import BigNumber from "bignumber.js";

/**
 * @typedef {object} TransferObject
 * @property {AccountId | string} accountId
 * @property {number | string | Long | BigNumber | Hbar} amount
 */

/**
 * Transfer cryptocurrency from some accounts to other accounts.
 */
export default class CryptoTransferTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {(Transfer | TransferObject)[]} [props.transfers]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {Transfer[]}
         */
        this._transfers = [];

        if (props.transfers != null) {
            this._transfers = props.transfers.map((transfer) => {
                if (transfer instanceof Transfer) {
                    return transfer;
                } else {
                    const amount =
                        transfer.amount instanceof Hbar
                            ? transfer.amount
                            : new Hbar(transfer.amount);

                    return new Transfer({
                        accountId: transfer.accountId,
                        amount,
                    });
                }
            });
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {CryptoTransferTransaction}
     */
    static _fromProtobuf(body) {
        const update = /** @type {proto.ICryptoTransferTransactionBody} */ (body.cryptoTransfer);

        return new CryptoTransferTransaction({
            transfers:
                update.transfers?.accountAmounts != null
                    ? update.transfers?.accountAmounts.map((aa) =>
                          Transfer._fromProtobuf(aa)
                      )
                    : undefined,
        });
    }

    /**
     * @returns {Transfer[]}
     */
    getTransfers() {
        return this._transfers;
    }

    /**
     * @param {AccountId | string} accountId
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @returns {CryptoTransferTransaction}
     */
    addTransfer(accountId, amount) {
        this._requireNotFrozen();
        this._transfers.push(
            new Transfer({
                accountId:
                    accountId instanceof AccountId
                        ? accountId
                        : AccountId.fromString(accountId),
                amount,
            })
        );

        return this;
    }

    /**
     * @param {AccountId | string} accountId
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @returns {CryptoTransferTransaction}
     */
    addSender(accountId, amount) {
        const value = amount instanceof Hbar ? amount : new Hbar(amount);
        return this.addTransfer(accountId, value.negated());
    }

    /**
     * @param {AccountId | string} accountId
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @returns {CryptoTransferTransaction}
     */
    addRecipient(accountId, amount) {
        return this.addTransfer(accountId, amount);
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.crypto.cryptoTransfer(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "cryptoTransfer";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoTransferTransactionBody}
     */
    _makeTransactionData() {
        return {
            transfers: {
                accountAmounts: this._transfers.map((transfer) =>
                    transfer._toProtobuf()
                ),
            },
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoTransfer",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    CryptoTransferTransaction._fromProtobuf
);
