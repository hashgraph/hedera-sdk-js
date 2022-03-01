import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
import TokenId from "../token/TokenId.js";
import NftId from "../token/NftId.js";
import Long from "long";
import Hbar from "../Hbar.js";
import HbarAllowance from "./HbarAllowance.js";
import TokenAllowance from "./TokenAllowance.js";
import TokenNftAllowance from "./TokenNftAllowance.js";

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
export default class AccountAllowanceApproveTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {HbarAllowance[]} [props.hbarApprovals]
     * @param {TokenAllowance[]} [props.tokenApprovals]
     * @param {TokenNftAllowance[]} [props.nftApprovals]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {HbarAllowance[]}
         */
        this._hbarApprovals =
            props.hbarApprovals != null ? props.hbarApprovals : [];

        /**
         * @private
         * @type {TokenAllowance[]}
         */
        this._tokenApprovals =
            props.tokenApprovals != null ? props.tokenApprovals : [];

        /**
         * @private
         * @type {TokenNftAllowance[]}
         */
        this._nftApprovals =
            props.nftApprovals != null ? props.nftApprovals : [];
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceApproveTransaction}
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
            new AccountAllowanceApproveTransaction({
                hbarApprovals: (allowanceApproval.cryptoAllowances != null
                    ? allowanceApproval.cryptoAllowances
                    : []
                ).map((approval) => HbarAllowance._fromProtobuf(approval)),
                tokenApprovals: (allowanceApproval.tokenAllowances != null
                    ? allowanceApproval.tokenAllowances
                    : []
                ).map((approval) => TokenAllowance._fromProtobuf(approval)),
                nftApprovals: (allowanceApproval.nftAllowances != null
                    ? allowanceApproval.nftAllowances
                    : []
                ).map((approval) => TokenNftAllowance._fromProtobuf(approval)),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {HbarAllowance[]}
     */
    get hbarApprovals() {
        return this._hbarApprovals;
    }

    /**
     * @internal
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceApproveTransaction}
     */
    addHbarAllowance(spenderAccountId, amount) {
        this._requireNotFrozen();

        this._hbarApprovals.push(
            new HbarAllowance({
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                amount: amount instanceof Hbar ? amount : new Hbar(amount),
                ownerAccountId: null,
            })
        );

        return this;
    }

    /**
     * @returns {TokenAllowance[]}
     */
    get tokenApprovals() {
        return this._tokenApprovals;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceApproveTransaction}
     */
    addTokenAllowance(tokenId, spenderAccountId, amount) {
        this._requireNotFrozen();

        this._tokenApprovals.push(
            new TokenAllowance({
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
                ownerAccountId: null,
            })
        );

        return this;
    }

    /**
     * @internal
     * @param {NftId | string} nftId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceApproveTransaction}
     */
    addTokenNftAllowance(nftId, spenderAccountId) {
        this._requireNotFrozen();

        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;
        const spender =
            typeof spenderAccountId === "string"
                ? AccountId.fromString(spenderAccountId)
                : spenderAccountId;
        let found = false;

        for (const allowance of this._nftApprovals) {
            if (
                allowance.tokenId.compare(id.tokenId) === 0 &&
                allowance.spenderAccountId.compare(spender) === 0
            ) {
                if (allowance.serialNumbers != null) {
                    allowance.serialNumbers.push(id.serial);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            this._nftApprovals.push(
                new TokenNftAllowance({
                    tokenId: id.tokenId,
                    spenderAccountId:
                        typeof spenderAccountId === "string"
                            ? AccountId.fromString(spenderAccountId)
                            : spenderAccountId,
                    serialNumbers: [id.serial],
                    ownerAccountId: null,
                })
            );
        }
        return this;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceApproveTransaction}
     */
    addAllTokenNftAllowance(tokenId, spenderAccountId) {
        this._requireNotFrozen();

        this._nftApprovals.push(
            new TokenNftAllowance({
                tokenId:
                    typeof tokenId === "string"
                        ? TokenId.fromString(tokenId)
                        : tokenId,
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                serialNumbers: null,
                ownerAccountId: null,
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
            cryptoAllowances: this._hbarApprovals.map((approval) =>
                approval._toProtobuf()
            ),
            tokenAllowances: this._tokenApprovals.map((approval) =>
                approval._toProtobuf()
            ),
            nftAllowances: this._nftApprovals.map((approval) =>
                approval._toProtobuf()
            ),
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `AccountAllowanceApproveTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoApproveAllowance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountAllowanceApproveTransaction._fromProtobuf
);
