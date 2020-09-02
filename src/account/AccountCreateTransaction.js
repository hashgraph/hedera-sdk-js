import Hbar from "../Hbar";
import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction from "../Transaction";
import { PublicKey } from "@hashgraph/cryptography";

export default class AccountCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {PublicKey=} props.key
     * @param {Hbar=} props.initialBalance
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?PublicKey}
         */
        this._key = null;

        /**
         * @private
         * @type {?Hbar}
         */
        this._initialBalance = null;

        if (props.initialBalance != null) {
            this.setInitialBalance(props.initialBalance);
        }
    }

    /**
     * @returns {?Hbar}
     */
    getInitialBalance() {
        return this._initialBalance;
    }

    /**
     * Set the initial amount to transfer into this account.
     *
     * @param {Hbar} initialBalance
     * @returns {this}
     */
    setInitialBalance(initialBalance) {
        this._initialBalance = initialBalance;

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getTransactionMethod(channel) {
        return (transaction) => channel.crypto.createAccount(transaction)
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "cryptoCreateAccount";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            initialBalance: this._initialBalance?.toTinybars(),

            // TODO
        }
    }
}
