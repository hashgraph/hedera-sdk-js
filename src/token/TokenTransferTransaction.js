import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenTransfersTransactionBody} proto.ITokenTransfersTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @typedef {object} TransferObjectInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} accountId
 * @property {number | string | Long} amount
 */

/**
 * @typedef {object} TransferObject
 * @property {TokenId} tokenId
 * @property {AccountId} accountId
 * @property {Long} amount
 */

/**
 * Transfers a new Hedera™ crypto-currency token.
 */
export default class TokenTransferTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {(TransferObjectInput)[]} [props.transfers]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {Map<string, TransferObject[]>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._transfers = new Map();

        for (const transfer of props.transfers != null ? props.transfers : []) {
            this.addTransfer(
                transfer.tokenId,
                transfer.accountId,
                transfer.amount
            );
        }
    }

    /**
     * @internal
     * @param {proto.ITransactionBody} body
     * @returns {TokenTransferTransaction}
     */
    static _fromProtobuf(body) {
        const transfersToken = /** @type {proto.ITokenTransfersTransactionBody} */ (body.tokenTransfers);

        const transfers = new TokenTransferTransaction();
        for (const list of transfersToken.tokenTransfers != null
            ? transfersToken.tokenTransfers
            : []) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (list.token)
            );
            for (const transfer of list.transfers != null
                ? list.transfers
                : []) {
                transfers.addTransfer(
                    tokenId,
                    AccountId._fromProtobuf(
                        /** @type {proto.IAccountID} */ (transfer.accountID)
                    ),
                    /** @type {Long} */ (transfer.amount)
                );
            }
        }

        return transfers;
    }

    /**
     * @returns {Map<string, TransferObject[]>}
     */
    get transfers() {
        return this._transfers;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {number | string | Long} amount
     * @returns {this}
     */
    addTransfer(tokenId, accountId, amount) {
        this._requireNotFrozen();
        const id = tokenId.toString();
        const transfers = this._transfers.get(id);

        const transfer = {
            tokenId:
                tokenId instanceof TokenId
                    ? tokenId
                    : TokenId.fromString(tokenId),
            accountId:
                accountId instanceof AccountId
                    ? accountId
                    : AccountId.fromString(accountId),
            amount: amount instanceof Long ? amount : Long.fromValue(amount),
        };

        if (transfers == null) {
            this._transfers.set(id, [transfer]);
        } else {
            transfers.push(transfer);
        }

        return this;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {number | Long} amount
     * @returns {this}
     */
    addSender(tokenId, accountId, amount) {
        const amount_ =
            amount instanceof Long
                ? amount.neg()
                : Long.fromValue(amount).neg();

        return this.addTransfer(tokenId, accountId, amount_);
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {number | Long} amount
     * @returns {this}
     */
    addRecipient(tokenId, accountId, amount) {
        return this.addTransfer(tokenId, accountId, amount);
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.transferTokens(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenTransfers";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenTransfersTransactionBody}
     */
    _makeTransactionData() {
        const tokenTransfers = [];

        for (const [tokenId, value] of this._transfers) {
            const transfers = [];
            for (const transfer of value) {
                transfers.push({
                    accountID: transfer.accountId._toProtobuf(),
                    amount: transfer.amount,
                });
            }

            tokenTransfers.push({
                token: TokenId.fromString(tokenId)._toProtobuf(),
                transfers,
            });
        }

        return {
            tokenTransfers,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenTransfers",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenTransferTransaction._fromProtobuf
);
