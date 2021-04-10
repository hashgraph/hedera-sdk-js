import TokenId from "./TokenId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenMintTransactionBody} proto.ITokenMintTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Mint a new Hedera™ crypto-currency token.
 */
export default class TokenMintTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {Long | number} [props.amount]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._amount = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.amount != null) {
            this.setAmount(props.amount);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TokenMintTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const mintToken = /** @type {proto.ITokenMintTransactionBody} */ (body.tokenCreation);

        return Transaction._fromProtobufTransactions(
            new TokenMintTransaction({
                tokenId:
                    mintToken.token != null
                        ? TokenId._fromProtobuf(mintToken.token)
                        : undefined,
                amount: mintToken.amount != null ? mintToken.amount : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @param {TokenId | string} tokenId
     * @returns {this}
     */
    setTokenId(tokenId) {
        this._requireNotFrozen();
        this._tokenId =
            tokenId instanceof TokenId ? tokenId : TokenId.fromString(tokenId);

        return this;
    }

    /**
     * @returns {?Long}
     */
    get amount() {
        return this._amount;
    }

    /**
     * @param {Long | number} amount
     * @returns {this}
     */
    setAmount(amount) {
        this._requireNotFrozen();
        this._amount = amount instanceof Long ? amount : Long.fromValue(amount);

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
        return channel.token.mintToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenMint";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenMintTransactionBody}
     */
    _makeTransactionData() {
        return {
            amount: this._amount,
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenMint",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenMintTransaction._fromProtobuf
);
