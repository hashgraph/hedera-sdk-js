import TokenId from "./TokenId";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenDeleteTransactionBody} proto.ITokenDeleteTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * Delete a new Hedera™ crypto-currency token.
 */
export default class TokenDeleteTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }
    }

    /**
     * @internal
     * @param {proto.ITransactionBody} body
     * @returns {TokenDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const deleteToken = /** @type {proto.ITokenDeleteTransactionBody} */ (body.tokenCreation);

        return new TokenDeleteTransaction({
            tokenId:
                deleteToken.token != null
                    ? TokenId._fromProtobuf(deleteToken.token)
                    : undefined,
        });
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
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.deleteToken(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenDeletion";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenDeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenDeletion",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenDeleteTransaction._fromProtobuf
);
