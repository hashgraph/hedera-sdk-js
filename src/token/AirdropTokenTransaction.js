import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountAmount from "./AccountAmount.js";
import TokenTransfer from "./AirdropTokenTransfer.js";
import AirdropNftTransfer from "./AirdropNftTransfer.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAirdropTransactionBody} HashgraphProto.proto.ITokenAirdropTransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionID} HashgraphProto.proto.TransactionID
 * @typedef {import("@hashgraph/proto").proto.AccountID} HashgraphProto.proto.AccountID
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 */

/**
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 * @typedef {import("./NftId.js").default} NftId
 * @typedef {import("./TokenId.js").default} TokenId
 */
export default class AirdropTokenTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {TokenTransfer[]} [props.tokenTransfer]
     * @param {[]} [props.tokenTransfer]
     */
    constructor(props = {}) {
        super();
        /**
         * @private
         * @type {TokenTransfer[]}
         */
        this._tokenTransfers = [];

        if (props.tokenTransfer != null) {
            this.setTokenTransfers(props.tokenTransfer);
        }
    }

    /**
     * @returns {TokenTransfer[]}
     */
    /*
    get tokenTransfers() {
        return this._tokenTransfers.filter((tokenTransfer) => {
            return tokenTransfer.accountAmounts.length > 0;
        });
    }
    */

    /**
     * @returns {Map<AccountId,Map<TokenId,Long>>}
     */
    /*
    get tokenNftTransfers() {
        const result = new Map();
        const nftTransfers = this._tokenTransfers.filter((tokenTransfer) => {
            return tokenTransfer.tokenNftTransfers.length > 0;
        });
        for (let tokenTransfer of this._tokenTransfers) {
            for (let nftTransfer of tokenTransfer.tokenNftTransfers) {
                const accountId = nftTransfer.receiverAccountId;
                const tokenId = tokenTransfer.tokenId;
                const serialNumber = nftTransfer.serialNumber;
                if (!result.has(accountId)) {
                    result.set(accountId, new Map());
                }
            }
        }

        return result;
    }
    */

    /**
     * @returns {Map<TokenId, number>}
     */
    get tokenDecimals() {
        const tokenDecimals = new Map();
        this._tokenTransfers.forEach((tokenTransfer) => {
            if (tokenTransfer.expectedDecimals) {
                tokenDecimals.set(
                    tokenTransfer.tokenId,
                    tokenTransfer.expectedDecimals,
                );
            }
        });
        return tokenDecimals;
    }

    /**
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     */
    addTokenTransfer(tokenId, accountId, amount) {
        const nonApproved = false;
        const accountAmount = new AccountAmount({
            accountId,
            amount,
            isApproval: nonApproved,
        });
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountAmounts: [accountAmount],
        });
        this._tokenTransfers.push(tokenTransfer);
    }

    /**
     *
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     * @returns {this}
     */
    addApprovedTokenTransfer(tokenId, accountId, amount) {
        const isApproval = true;
        const accountAmount = new AccountAmount({
            accountId,
            amount,
            isApproval,
        });
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountAmounts: [accountAmount],
        });
        this._tokenTransfers.push(tokenTransfer);
        return this;
    }

    /**
     *
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     * @param {number} expectedDecimals
     * @returns {this}
     */
    addApprovedTokenTransferWithDecimals(
        tokenId,
        accountId,
        amount,
        expectedDecimals,
    ) {
        const isApproval = true;
        const accountAmount = new AccountAmount({
            accountId,
            amount,
            isApproval,
        });
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountAmounts: [accountAmount],
            expectedDecimals,
        });
        this._tokenTransfers.push(tokenTransfer);
        return this;
    }

    /**
     *
     * @param {TokenId} tokenId
     * @param {AccountId} accountId
     * @param {Long} amount
     * @param {number} expectedDecimals
     * @returns {this}
     */
    addTokenTransferWithDecimals(tokenId, accountId, amount, expectedDecimals) {
        const isApproval = false;
        const accountAmount = new AccountAmount({
            accountId,
            amount,
            isApproval,
        });
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountAmounts: [accountAmount],
            expectedDecimals,
        });
        this._tokenTransfers.push(tokenTransfer);
        return this;
    }

    /**
     * @param {NftId} nftId
     * @param {AccountId} senderAccountId
     * @param {AccountId} receiverAccountId
     */
    addNftTransfer(nftId, senderAccountId, receiverAccountId) {
        const isApproved = true;

        const nftTransfer = new AirdropNftTransfer({
            senderAccountId,
            receiverAccountId,
            isApproved,
            serialNumber: nftId.serial,
        });
        const tokenTransfer = new TokenTransfer({
            tokenNftTransfers: [nftTransfer],
        });
        this._tokenTransfers.push(tokenTransfer);
    }

    /**
     *
     * @param {NftId} nftId
     * @param {AccountId} sender
     * @param {AccountId} receiver
     * @returns
     */
    addApprovedNftTransfer(nftId, sender, receiver) {
        const isApproved = true;
        const nftTransfer = new AirdropNftTransfer({
            senderAccountId: sender,
            receiverAccountId: receiver,
            serialNumber: nftId.serial,
            isApproved,
        });
        const tokenTransfer = new TokenTransfer({
            tokenId: nftId.tokenId,
            tokenNftTransfers: [nftTransfer],
        });
        this._tokenTransfers.push(tokenTransfer);
        return this;
    }

    /**
     * @param {TokenTransfer[]} tokenTransfers
     * @returns {this}
     */
    setTokenTransfers(tokenTransfers) {
        this._tokenTransfers = tokenTransfers;
        return this;
    }

    /**
     * @param {TokenTransfer[]} tokenTransferList
     * @returns {this}
     */
    addTokenTransferList(tokenTransferList) {
        this._tokenTransfers.push(...tokenTransferList);
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
                        TokenTransfer._fromProtobuf(tokenTransfer),
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
