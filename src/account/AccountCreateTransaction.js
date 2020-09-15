import Hbar from "../Hbar";
import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import AccountId from "./AccountId";
import Transaction, {
    DEFAULT_AUTO_RENEW_PERIOD,
    DEFAULT_RECORD_THRESHOLD,
    TRANSACTION_REGISTRY,
} from "../Transaction";
import { Key } from "@hashgraph/cryptography";
import { _fromProtoKey, _toProtoKey } from "../util";
import Long from "long";
import BigNumber from "bignumber.js";

/**
 * Create a new Hedera™ crypto-currency account.
 */
export default class AccountCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {Key} [props.key]
     * @param {number | string | Long | BigNumber | Hbar} [props.initialBalance]
     * @param {number | string | Long | BigNumber | Hbar} [props.sendRecordThreshold]
     * @param {number | string | Long | BigNumber | Hbar} [props.receiveRecordThreshold]
     * @param {boolean} [props.receiverSignatureRequired]
     * @param {AccountId} [props.proxyAccountId]
     * @param {number | Long} [props.autoRenewPeriod]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Key}
         */
        this._key = null;

        /**
         * @private
         * @type {?Hbar}
         */
        this._initialBalance = null;

        /**
         * @private
         * @type {Hbar}
         */
        this._sendRecordThreshold = DEFAULT_RECORD_THRESHOLD;

        /**
         * @private
         * @type {Hbar}
         */
        this._receiveRecordThreshold = DEFAULT_RECORD_THRESHOLD;

        /**
         * @private
         * @type {boolean}
         */
        this._receiverSignatureRequired = false;

        /**
         * @private
         * @type {?AccountId}
         */
        this._proxyAccountId = null;

        /**
         * @private
         * @type {Long}
         */
        this._autoRenewPeriod = DEFAULT_AUTO_RENEW_PERIOD;

        if (props.key != null) {
            this.setKey(props.key);
        }

        if (props.sendRecordThreshold != null) {
            this.setSendRecordThreshold(props.sendRecordThreshold);
        }

        if (props.receiveRecordThreshold != null) {
            this.setReceiveRecordThreshold(props.receiveRecordThreshold);
        }

        if (props.receiverSignatureRequired != null) {
            this.setReceiverSignatureRequired(props.receiverSignatureRequired);
        }

        if (props.initialBalance != null) {
            this.setInitialBalance(props.initialBalance);
        }

        if (props.proxyAccountId != null) {
            this.setProxyAccountId(props.proxyAccountId);
        }

        if (props.autoRenewPeriod != null) {
            this.setAutoRenewPeriod(props.autoRenewPeriod);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {AccountCreateTransaction}
     */
    static _fromProtobuf(body) {
        const create = /** @type {proto.ICryptoCreateTransactionBody} */ (body.cryptoCreateAccount);

        return new AccountCreateTransaction({
            key: create.key != null ? _fromProtoKey(create.key) : undefined,
            initialBalance:
                create.initialBalance != null
                    ? create.initialBalance
                    : undefined,
            sendRecordThreshold:
                create.sendRecordThreshold != null
                    ? create.sendRecordThreshold
                    : undefined,
            receiveRecordThreshold:
                create.receiveRecordThreshold != null
                    ? create.receiveRecordThreshold
                    : undefined,
            receiverSignatureRequired:
                create.receiverSigRequired != null
                    ? create.receiverSigRequired
                    : undefined,
            proxyAccountId:
                create.proxyAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (create.proxyAccountID)
                      )
                    : undefined,
            autoRenewPeriod:
                create.autoRenewPeriod != null
                    ? create.autoRenewPeriod.seconds != null
                        ? create.autoRenewPeriod.seconds
                        : undefined
                    : undefined,
        });
    }

    /**
     * @returns {?Key}
     */
    getKey() {
        return this._key;
    }

    /**
     * Set the key for this account.
     *
     * This is the key that must sign each transfer out of the account.
     *
     * If `receiverSignatureRequired` is true, then the key must also sign
     * any transfer into the account.
     *
     * @param {Key} key
     * @returns {this}
     */
    setKey(key) {
        this._requireNotFrozen();
        this._key = key;

        return this;
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
     * @param {number | string | Long | BigNumber | Hbar} initialBalance
     * @returns {this}
     */
    setInitialBalance(initialBalance) {
        this._requireNotFrozen();
        this._initialBalance =
            initialBalance instanceof Hbar
                ? initialBalance
                : new Hbar(initialBalance);

        return this;
    }

    /**
     * @returns {Hbar}
     */
    getSendRecordThreshold() {
        return this._sendRecordThreshold;
    }

    /**
     * Set the threshold amount for which a transaction record is created for any transfer of hbars
     * from this account.
     *
     * @param {number | string | Long | BigNumber | Hbar} sendRecordThreshold
     * @returns {this}
     */
    setSendRecordThreshold(sendRecordThreshold) {
        this._requireNotFrozen();
        this._sendRecordThreshold =
            sendRecordThreshold instanceof Hbar
                ? sendRecordThreshold
                : new Hbar(sendRecordThreshold);

        return this;
    }

    /**
     * @returns {Hbar}
     */
    getReceiveRecordThreshold() {
        return this._receiveRecordThreshold;
    }

    /**
     * Set the threshold amount for which a transaction record is created for any transfer of hbars
     * to this account.
     *
     * @param {number | string | Long | BigNumber | Hbar} receiveRecordThreshold
     * @returns {this}
     */
    setReceiveRecordThreshold(receiveRecordThreshold) {
        this._requireNotFrozen();
        this._receiveRecordThreshold =
            receiveRecordThreshold instanceof Hbar
                ? receiveRecordThreshold
                : new Hbar(receiveRecordThreshold);

        return this;
    }

    /**
     * @returns {boolean}
     */
    getReceiverSignatureRequired() {
        return this._receiverSignatureRequired;
    }

    /**
     * Set to true to require the key for this account to sign any transfer of
     * hbars to this account.
     *
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
    getProxyAccountId() {
        return this._proxyAccountId;
    }

    /**
     * Set the ID of the account to which this account is proxy staked.
     *
     * @param {AccountId} proxyAccountId
     * @returns {this}
     */
    setProxyAccountId(proxyAccountId) {
        this._requireNotFrozen();
        this._proxyAccountId = proxyAccountId;

        return this;
    }

    /**
     * @returns {Long}
     */
    getAutoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * Set the auto renew period for this account.
     *
     * @param {number | Long} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod =
            autoRenewPeriod instanceof Long
                ? autoRenewPeriod
                : Long.fromValue(autoRenewPeriod);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) => channel.crypto.createAccount(transaction);
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
            key: this._key != null ? _toProtoKey(this._key) : null,
            initialBalance: this._initialBalance?.toTinybars(),
            autoRenewPeriod: {
                seconds: this._autoRenewPeriod,
            },
            proxyAccountID: this._proxyAccountId?._toProtobuf(),
            receiveRecordThreshold: this._receiveRecordThreshold.toTinybars(),
            sendRecordThreshold: this._sendRecordThreshold.toTinybars(),
            receiverSigRequired: this._receiverSignatureRequired,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoCreateAccount",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountCreateTransaction._fromProtobuf
);
