import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
    SCHEDULE_CREATE_TRANSACTION,
} from "../transaction/Transaction.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import NodeAccountIdSignatureMap from "../transaction/NodeAccountIdSignatureMap.js";

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
     * @param {string} [props.memo]
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
        this._memo = null;

        if (props.adminKey != null) {
            this.setAdminKey(props.adminKey);
        }

        if (props.payerAccountID != null) {
            this.setPayerAccountId(props.payerAccountID);
        }

        if (props.memo != null) {
            this.setMemo(props.memo);
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
                memo: create.memo != null ? create.memo : undefined,
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
    setMemo(memo) {
        this._requireNotFrozen();
        this._memo = memo;

        return this;
    }

    /**
     * @returns {?string}
     */
    get Memo() {
        return this._memo;
    }

    /**
     * @param {Transaction} transaction
     * @returns {this}
     */
    setTransaction(transaction) {
        if (transaction._signedTransactions.length !== 1) {
            throw new Error(
                "`ScheduleCreateTransaction.setTransaction()` requires `Transaction` parameter to have a single node `AccountId` set"
            );
        }

        const signed = transaction._signedTransactions[0];

        this._transactionBody = /** @type {Uint8Array | null } */ (signed.bodyBytes);

        if (this._sigMap == null) {
            this._sigMap = {};
        }

        if (this._sigMap.sigPair == null) {
            this._sigMap.sigPair = [];
        }

        if (
            signed.sigMap != null &&
            signed.sigMap.sigPair != null
        ) {
            for (const sigPair of signed.sigMap.sigPair) {
                this._sigMap.sigPair.push(sigPair);
            }
        }

        return this;
    }

    /**
     * @returns {NodeAccountIdSignatureMap}
     */
    get scheduleSignatures() {
        if(this._sigMap != null){
            return NodeAccountIdSignatureMap._fromTransactionSigMap(this._sigMap)
        } else {
            return new NodeAccountIdSignatureMap()
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
            memo: this._memo,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "scheduleCreate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ScheduleCreateTransaction._fromProtobuf
);

SCHEDULE_CREATE_TRANSACTION.push(() => new ScheduleCreateTransaction());
