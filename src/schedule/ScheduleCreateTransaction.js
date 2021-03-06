import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
    SCHEDULE_CREATE_TRANSACTION,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import NodeAccountIdSignatureMap from "../transaction/NodeAccountIdSignatureMap.js";
import * as hex from "../encoding/hex.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IScheduleCreateTransactionBody} proto.IScheduleCreateTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").ISignatureMap} proto.ISignatureMap
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("@hashgraph/cryptography").PublicKey} PublicKey
 * @typedef {import("@hashgraph/cryptography").PrivateKey} PrivateKey
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
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
     * @param {string} [props.scheduleMemo]
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
         * @type {?proto.ISignatureMap}
         */
        this._sigMap = null;

        /**
         * @private
         * @type {?string}
         */
        this._scheduleMemo = null;

        /**
         * @private
         * @type {Set<string>}
         */
        this._scheduledSignerPublicKeys = new Set();

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.payerAccountID != null) {
            this.setPayerAccountId(props.payerAccountID);
        }

        if (props.scheduleMemo != null) {
            this.setScheduleMemo(props.scheduleMemo);
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
        const create = /** @type {proto.IScheduleCreateTransactionBody} */ (body.scheduleCreate);

        return Transaction._fromProtobufTransactions(
            new ScheduleCreateTransaction({
                adminKey:
                    create.adminKey != null
                        ? keyFromProtobuf(create.adminKey)
                        : undefined,
                payerAccountID:
                    create.payerAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (create.payerAccountID)
                          )
                        : undefined,
                scheduleMemo: create.memo != null ? create.memo : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @internal
     * @param {Uint8Array} bodyBytes
     * @returns {this}
     */
    _setTransactionBody(bodyBytes) {
        this._transactionBody = bodyBytes;

        return this;
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
     * @param {AccountId} account
     * @returns {this}
     */
    setPayerAccountId(account) {
        this._requireNotFrozen();
        this._payerAccountId = account;

        return this;
    }

    /**
     * @param {string} memo
     * @returns {this}
     */
    setScheduleMemo(memo) {
        this._requireNotFrozen();
        this._scheduleMemo = memo;

        return this;
    }

    /**
     * @returns {?string}
     */
    get getScheduleMemo() {
        this._requireNotFrozen();
        return this._scheduleMemo;
    }

    /**
     * @param {Transaction} transaction
     * @returns {this}
     */
    setScheduledTransaction(transaction) {
        this._requireNotFrozen();
        transaction._requireNotFrozen();

        this._transactionBody = transaction.schedule()._transactionBody;
        this._sigMap = null;

        return this;
    }

    /**
     * @returns {NodeAccountIdSignatureMap}
     */
    get scheduledSignatures() {
        if (this._sigMap != null) {
            return NodeAccountIdSignatureMap._fromTransactionSigMap(
                this._sigMap
            );
        } else {
            return new NodeAccountIdSignatureMap();
        }
    }

    /**
     * @param {PublicKey} key
     * @param {Uint8Array} signature
     * @returns {this}
     */
    addScheduleSignature(key, signature) {
        if (this._sigMap == null) {
            this._sigMap = {};
        }

        if (this._sigMap.sigPair == null) {
            this._sigMap.sigPair = [];
        }

        this._sigMap.sigPair.push({
            pubKeyPrefix: key.toBytes(),
            ed25519: signature,
        });

        return this;
    }

    /**
     * @param {PrivateKey} key
     * @returns {Promise<this>}
     */
    signScheduled(key) {
        return this.signWith(key.publicKey, (message) =>
            Promise.resolve(key.sign(message))
        );
    }

    /**
     * @param {Client} client
     * @returns {Promise<this>}
     */
    signScheduledWithOperator(client) {
        const operator = client._operator;

        if (operator == null) {
            throw new Error(
                "Client operator must be set to sign with operator"
            );
        }

        return this.signWith(operator.publicKey, (message) =>
            Promise.resolve(operator.transactionSigner(message))
        );
    }

    /**
     *
     * @param {PublicKey} privateKey
     * @param {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
     * @returns {Promise<this>}
     */
    async signScheduledWith(privateKey, transactionSigner) {
        const publicKeyData = privateKey.toBytes();

        // note: this omits the DER prefix on purpose because Hedera doesn't
        // support that in the protobuf. this means that we would fail
        // to re-inflate [this._signerPublicKeys] during [fromBytes] if we used DER
        // prefixes here
        const publicKeyHex = hex.encode(publicKeyData);

        if (this._scheduledSignerPublicKeys.has(publicKeyHex)) {
            // this public key has already signed this transaction
            return this;
        }

        const bodyBytes = /** @type {Uint8Array} */ (this._transactionBody);
        const signature = await transactionSigner(bodyBytes);

        if (this._sigMap == null) {
            this._sigMap = {};
        }

        if (this._sigMap.sigPair == null) {
            this._sigMap.sigPair = [];
        }

        this._sigMap.sigPair.push({
            pubKeyPrefix: publicKeyData,
            ed25519: signature,
        });

        this._scheduledSignerPublicKeys.add(publicKeyHex);

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
        return channel.schedule.createSchedule(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "scheduleCreate";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IScheduleCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            adminKey:
                this._adminKey != null ? keyToProtobuf(this._adminKey) : null,
            payerAccountID:
                this._payerAccountId != null
                    ? this._payerAccountId._toProtobuf()
                    : null,
            sigMap: this._sigMap,
            transactionBody: this._transactionBody,
            memo: this._scheduleMemo,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "scheduleCreate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ScheduleCreateTransaction._fromProtobuf
);

SCHEDULE_CREATE_TRANSACTION.push(() => new ScheduleCreateTransaction());
