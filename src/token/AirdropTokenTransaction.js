import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import TokenTransferList from "./TokenTransferList.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAirdropTransactionBody} HashgraphProto.proto.ITokenAirdropTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionID} HashgraphProto.proto.TransactionID
 * @typedef {import("@hashgraph/proto").proto.AccountID} HashgraphProto.proto.AccountID
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenRejectTransactionBody} HashgraphProto.proto.ITokenRejectTransactionBody
 * @typedef {import("@hashgraph/proto").proto.TokenReference} HashgraphProto.proto.TokenReference
 */

/**
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */
export default class AirdropTokenTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TokenTransferList[]} [props.tokenTransfer]
     */
    constructor(props = {}) {
        super();
        /**
         * @private
         * @type {TokenTransferList[]}
         */
        this._tokenTransfers = [];

        if (props.tokenTransfer != null) {
            this.setTokenTransfers(props.tokenTransfer);
        }
    }

    /**
     * @returns {TokenTransferList[]}
     */
    get tokenTransfers() {
        return this._tokenTransfers;
    }

    /**
     * @param {TokenTransferList[]} tokenTransfers
     * @returns {this}
     */
    setTokenTransfers(tokenTransfers) {
        console.log(tokenTransfers.length);
        this._tokenTransfers = tokenTransfers;
        return this;
    }

    /**
     * @returns {HashgraphProto.proto.ITokenAirdropTransactionBody}
     */
    _makeTransactionData() {
        return {
            tokenTransfers: this._tokenTransfers.map((tokenTransfer) =>
                tokenTransfer._toProtobuf(),
            ),
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {AirdropTokenTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const tokenAirdrop =
            /** @type {HashgraphProto.proto.ITokenAirdropTransactionBody} */ (
                body.tokenAirdrop
            );

        return Transaction._fromProtobufTransactions(
            new AirdropTokenTransaction({
                tokenTransfer: tokenAirdrop.tokenTransfers?.map(
                    (tokenTransfer) =>
                        TokenTransferList._fromProtobuf(tokenTransfer),
                ),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenAirdrop";
    }
}

TRANSACTION_REGISTRY.set(
    "tokenAirdrop",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AirdropTokenTransaction._fromProtobuf,
);
