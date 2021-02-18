import Hbar from "../Hbar.js";
import AccountId from "../account/AccountId.js";
import Transaction from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import Duration from "../Duration.js";

/**
 * @typedef {object} ProtoSignaturePair
 * @property {(Uint8Array | null)=} pubKeyPrefix
 * @property {(Uint8Array | null)=} ed25519
 */

/**
 * @typedef {object | null} ProtoSigMap
 * @property {(ProtoSignaturePair[] | null)=} sigPair
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoCreateTransactionBody} proto.ICryptoCreateTransactionBody
 * @typedef {import("@hashgraph/proto").ISchedule} proto.ICryptoCreateTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ISignatureMap} proto.ISignatureMap
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../Timestamp.js").default} Timestamp
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Create a new Hedera™ crypto-currency account.
 */
export default class ScheduleCreateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {Key} [props.adminKey]
     * @param {AccountId} [props.payerAccountID]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?Key}
         */
        this._adminKey = null;

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._transactionBody = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._payerAccountId = null;

        /**
         * @private
         * @type {?ProtoSigMap}
         */
        this._sigMap = null;

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.payerAccountID != null) {
            this.setPayerAccountId(props.payerAccountID);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {ScheduleCreateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const create = /** @type {proto.IScheduleCreateTransactionBody} */ (body.);

        return Transaction._fromProtobufTransactions(
            new ScheduleCreateTransaction({
                adminKey:
                    create.key != null
                        ? keyFromProtobuf(create.key)
                        : undefined,
                payerAccountID:
                    create.payerAccountID != null
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
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?Key}
     */
    get adminKey() {
        return this._adminKey;
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
    setAdminKey(key) {
        this._requireNotFrozen();
        this._adminKey = key;

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get payerAccountId() {
        return this._payerAccountId;
    }

    /**
     * Set the initial amount to transfer into this account.
     *
     * @param {AccountId} account
     * @returns {this}
     */
    setPayerAccountId(account) {
        this._requireNotFrozen();
        this._payerAccountId = account;

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
        return channel.crypto.createAccount(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
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
            key: this._key != null ? keyToProtobuf(this._key) : null,
            initialBalance:
                this._initialBalance != null
                    ? this._initialBalance.toTinybars()
                    : null,
            autoRenewPeriod: this._autoRenewPeriod._toProtobuf(),
            proxyAccountID:
                this._proxyAccountId != null
                    ? this._proxyAccountId._toProtobuf()
                    : null,
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
