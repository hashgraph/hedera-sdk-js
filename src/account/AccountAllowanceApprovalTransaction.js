import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
import TokenId from "../token/TokenId.js";
import HbarApproval from "./HbarApproval.js";
import TokenApproval from "./TokenApproval.js";
import Long from "long";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoApproveAllowanceTransactionBody} proto.ICryptoApproveAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../long.js").LongObject} LongObject
 */

/**
 * Change properties for the given account.
 */
export default class AccountAllowanceApprovalTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {HbarApproval[]} [props.hbarApprovals]
     * @param {TokenApproval[]} [props.tokenApprovals]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {HbarApproval[]}
         */
        this._hbarApprovals =
            props.hbarApprovals != null ? props.hbarApprovals : [];

        /**
         * @private
         * @type {TokenApproval[]}
         */
        this._tokenApprovals =
            props.tokenApprovals != null ? props.tokenApprovals : [];
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceApprovalTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const allowanceApproval =
            /** @type {proto.ICryptoApproveAllowanceTransactionBody} */ (
                body.cryptoApproveAllowance
            );

        return Transaction._fromProtobufTransactions(
            new AccountAllowanceApprovalTransaction({
                hbarApprovals: (allowanceApproval.cryptoApproval != null
                    ? allowanceApproval.cryptoApproval
                    : []
                ).map((approval) => HbarApproval._fromProtobuf(approval)),
                tokenApprovals: (allowanceApproval.tokenApproval != null
                    ? allowanceApproval.tokenApproval
                    : []
                ).map((approval) => TokenApproval._fromProtobuf(approval)),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {HbarApproval[]}
     */
    get hbarApprovals() {
        return this._hbarApprovals;
    }

    /**
     * @internal
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceApprovalTransaction}
     */
    addHbarApproval(spenderAccountId, amount) {
        this._requireNotFrozen();

        this._hbarApprovals.push(
            new HbarApproval({
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                amount: amount instanceof Hbar ? amount : new Hbar(amount),
            })
        );

        return this;
    }

    /**
     * @returns {TokenApproval[]}
     */
    get tokenApprovals() {
        return this._tokenApprovals;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceApprovalTransaction}
     */
    addTokenApproval(tokenId, spenderAccountId, amount) {
        this._requireNotFrozen();

        this._tokenApprovals.push(
            new TokenApproval({
                tokenId:
                    typeof tokenId === "string"
                        ? TokenId.fromString(tokenId)
                        : tokenId,
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                amount:
                    typeof amount === "number"
                        ? Long.fromNumber(amount)
                        : amount,
            })
        );

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        this._hbarApprovals.map((approval) =>
            approval.spenderAccountId.validateChecksum(client)
        );
        this._tokenApprovals.map((approval) => {
            approval.tokenId.validateChecksum(client);
            approval.spenderAccountId.validateChecksum(client);
        });
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.approveAllowances(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoApproveAllowance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoApproveAllowanceTransactionBody}
     */
    _makeTransactionData() {
        return {
            cryptoApproval: this._hbarApprovals.map((approval) =>
                approval._toProtobuf()
            ),
            tokenApproval: this._tokenApprovals.map((approval) =>
                approval._toProtobuf()
            ),
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoApproveAllowance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountAllowanceApprovalTransaction._fromProtobuf
);
