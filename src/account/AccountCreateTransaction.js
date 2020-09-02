import Hbar from "../Hbar";
import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction, { DEFAULT_AUTO_RENEW_PERIOD } from "../Transaction";
import { Key } from "@hashgraph/cryptography";
import { _toProtoKey } from "../util";
import Long from "long";
import { AccountId } from "..";

const DEFAULT_RECORD_THRESHOLD = Hbar.fromTinybars(
    Long.fromString("9223372036854775807")
);

export default class AccountCreateTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {Key=} props.key
     * @param {Hbar=} props.initialBalance
     * @param {Hbar=} props.sendRecordThreshold
     * @param {Hbar=} props.receiveRecordThreshold
     * @param {boolean=} props.receiverSignatureRequired
     * @param {AccountId=} props.proxyAccountId
     * @param {number=} props.autoRenewPeriod
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
         * @type {number}
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
     * @returns {?Key}
     */
    getKey() {
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
        this._requireNotFrozen();
        this._initialBalance = initialBalance;

        return this;
    }

    /**
     * @returns {Hbar}
     */
    getSendRecordThreshold() {
        return this._sendRecordThreshold;
    }

    /**
     * @param {Hbar} sendRecordThreshold
     * @returns {this}
     */
    setSendRecordThreshold(sendRecordThreshold) {
        this._requireNotFrozen();
        this._sendRecordThreshold = sendRecordThreshold;

        return this;
    }

    /**
     * @returns {Hbar}
     */
    getReceiveRecordThreshold() {
        return this._receiveRecordThreshold;
    }

    /**
     * @param {Hbar} receiveRecordThreshold
     * @returns {this}
     */
    setReceiveRecordThreshold(receiveRecordThreshold) {
        this._requireNotFrozen();
        this._receiveRecordThreshold = receiveRecordThreshold;

        return this;
    }

    /**
     * @returns {boolean}
     */
    getReceiverSignatureRequired() {
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
    getProxyAccountId() {
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
     * @returns {number}
     */
    getAutoRenewPeriod() {
        return this._autoRenewPeriod;
    }

    /**
     * @param {number} autoRenewPeriod
     * @returns {this}
     */
    setAutoRenewPeriod(autoRenewPeriod) {
        this._requireNotFrozen();
        this._autoRenewPeriod = autoRenewPeriod;

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getTransactionMethod(channel) {
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
