import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenAssociateTransactionBody} proto.ITokenAssociateTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Associate a new Hedera™ crypto-currency token.
 */
export default class TokenAssociateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {(TokenId | string)[]} [props.tokenIds]
     * @param {AccountId | string} [props.accountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TokenId[]}
         */
        this._tokenIds = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._accountId = null;

        if (props.tokenIds != null) {
            this.setTokenIds(props.tokenIds);
        }

        if (props.accountId != null) {
            this.setAccountId(props.accountId);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TokenAssociateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const associateToken = /** @type {proto.ITokenAssociateTransactionBody} */ (body.tokenCreation);

        return Transaction._fromProtobufTransactions(
            new TokenAssociateTransaction({
                tokenIds:
                    associateToken.tokens != null
                        ? associateToken.tokens.map((token) =>
                              TokenId._fromProtobuf(token)
                          )
                        : undefined,
                accountId:
                    associateToken.account != null
                        ? AccountId._fromProtobuf(associateToken.account)
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
     * @returns {?TokenId[]}
     */
    get tokenIds() {
        return this._tokenIds;
    }

    /**
     * @param {(TokenId | string)[]} tokenIds
     * @returns {this}
     */
    setTokenIds(tokenIds) {
        this._requireNotFrozen();
        this._tokenIds = tokenIds.map((tokenId) =>
            tokenId instanceof TokenId ? tokenId : TokenId.fromString(tokenId)
        );

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {AccountId | string} accountId
     * @returns {this}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

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
        return channel.token.associateTokens(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenAssociate";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenAssociateTransactionBody}
     */
    _makeTransactionData() {
        return {
            tokens:
                this._tokenIds != null
                    ? this._tokenIds.map((tokenId) => tokenId._toProtobuf())
                    : null,
            account:
                this._accountId != null ? this._accountId._toProtobuf() : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenAssociate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenAssociateTransaction._fromProtobuf
);
