import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Hbar from "../Hbar";
import AccountId from "../account/AccountId";
import Transfer from "../Transfer";
import Transaction from "../Transaction";
import { _toProtoKey } from "../util";

export default class CryptoTransferTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {Transfer[]} [props.transfers]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {Transfer[]}
         */
        this._transfers = [];

        if (props.transfers != null) {
            this._transfers = props.transfers;
        }
    }

    /**
     * @returns {Transfer[]}
     */
    getTransfers() {
        return this._transfers;
    }

    /**
     * @param {AccountId | string} accountId
     * @param {Hbar} amount
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
     * @param {Hbar} amount
     * @returns {CryptoTransferTransaction}
     */
    addSender(accountId, amount) {
        return this.addTransfer(accountId, amount.negated());
    }

    /**
     * @param {AccountId | string} accountId
     * @param {Hbar} amount
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
    _getTransactionMethod(channel) {
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
