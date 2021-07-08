import TokenId from "./TokenId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import CustomFixedFee from "./CustomFixedFee.js";
import CustomFractionalFee from "./CustomFractionalFee.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ITokenFeeScheduleUpdateTransactionBody} proto.ITokenFeeScheduleUpdateTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./CustomFee.js").default} CustomFee
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

/**
 * FeeScheduleUpdate a new Hedera™ crypto-currency token.
 */
export default class TokenFeeScheduleUpdateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {TokenId | string} [props.tokenId]
     * @param {CustomFee[]} [props.customFees]
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
         * @type {CustomFee[]}
         */
        this._customFees = [];

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.customFees != null) {
            this.setCustomFees(props.customFees);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TokenFeeScheduleUpdateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const feeScheduleUpdate =
            /** @type {proto.ITokenFeeScheduleUpdateTransactionBody} */ (
                body.tokenFeeScheduleUpdate
            );

        return Transaction._fromProtobufTransactions(
            new TokenFeeScheduleUpdateTransaction({
                tokenId:
                    feeScheduleUpdate.tokenId != null
                        ? TokenId._fromProtobuf(feeScheduleUpdate.tokenId)
                        : undefined,
                customFees:
                    feeScheduleUpdate.customFees != null
                        ? feeScheduleUpdate.customFees.map((fee) => {
                              if (fee.fixedFee != null) {
                                  return CustomFixedFee._fromProtobuf(fee);
                              } else {
                                  return CustomFractionalFee._fromProtobuf(fee);
                              }
                          })
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
            typeof tokenId === "string"
                ? TokenId.fromString(tokenId)
                : TokenId._fromProtobuf(tokenId._toProtobuf());

        return this;
    }

    /**
     * @returns {CustomFee[]}
     */
    get customFees() {
        return this._customFees;
    }

    /**
     * @param {CustomFee[]} fees
     * @returns {this}
     */
    setCustomFees(fees) {
        this._requireNotFrozen();
        this._customFees = fees;

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
        return channel.token.updateTokenFeeSchedule(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenFeeScheduleUpdate";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ITokenFeeScheduleUpdateTransactionBody}
     */
    _makeTransactionData() {
        return {
            tokenId: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            customFees: this._customFees.map((fee) => fee._toProtobuf()),
        };
    }
}

TRANSACTION_REGISTRY.set(
    "tokenFeeScheduleUpdate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenFeeScheduleUpdateTransaction._fromProtobuf
);
