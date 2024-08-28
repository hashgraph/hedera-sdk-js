import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import TokenTransfer from "./TokenTransfer.js";
import NftTransfer from "./TokenNftTransfer.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenAirdropTransactionBody} HashgraphProto.proto.ITokenAirdropTransactionBody
 * @typedef {import("@hashgraph/proto").proto.AccountAmount} HashgraphProto.proto.AccountAmount
 * @typedef {import("@hashgraph/proto").proto.NftTransfer} HashgraphProto.proto.NftTransfer
 * @typedef {import("@hashgraph/proto").proto.TokenTransferList} HashgraphProto.proto.TokenTransferList
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
     * @param {TokenTransfer[]} [props.tokenTransfers]
     * @param {NftTransfer[]} [props.nftTransfers]
     */
    constructor(props = {}) {
        super();
        /**
         * @private
         * @type {TokenTransfer[]}
         */
        this._tokenTransfers = [];

        if (props.tokenTransfers != null) {
            this.setTokenTransfers(props.tokenTransfers);
        }

        /**
         * @private
         * @type {NftTransfer[]}
         */
        this._nftTransfers = [];

        if (props.nftTransfers != null) {
            this.setNftTransfers(props.nftTransfers);
        }
    }

    /**
     * @returns {Map<TokenId, Map<AccountId, Long>>}
     */
    get tokenTransfers() {
        const result = new Map();
        return result;
        /*return this._tokenTransfers.filter((tokenTransfer) => {
            return tokenTransfer.accountAmounts.length > 0;
        });*/
    }

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
        const NON_APPROVED = false;
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountId: accountId,
            amount: amount,
            isApproved: NON_APPROVED,
            expectedDecimals: null,
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
        const APPROVED = true;
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountId: accountId,
            amount: amount,
            isApproved: APPROVED,
            expectedDecimals: null,
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
        const IS_APPROVED = true;
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountId,
            amount,
            isApproved: IS_APPROVED,
            expectedDecimals: expectedDecimals,
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
        const IS_APPROVED = false;
        const tokenTransfer = new TokenTransfer({
            tokenId,
            accountId,
            amount,
            isApproved: IS_APPROVED,
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
        const isApproved = false;

        const nftTransfer = new NftTransfer({
            tokenId: nftId.tokenId,
            senderAccountId,
            receiverAccountId,
            serialNumber: nftId.serial,
            isApproved,
        });
        this._nftTransfers.push(nftTransfer);
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
        const nftTransfer = new NftTransfer({
            senderAccountId: sender,
            receiverAccountId: receiver,
            serialNumber: nftId.serial,
            tokenId: nftId.tokenId,
            isApproved,
        });
        this._nftTransfers.push(nftTransfer);
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
     * @param {NftTransfer[]} nftTransfers
     * @returns {this}
     */
    setNftTransfers(nftTransfers) {
        this._nftTransfers = nftTransfers;
        return this;
    }

    /**
     * @returns {HashgraphProto.proto.ITokenAirdropTransactionBody}
     */
    _makeTransactionData() {
        /**
         * @type {HashgraphProto.proto.AccountAmount[]}
         */
        const tokenTransfers = this._tokenTransfers.map((tokenTransfer) => {
            return {
                accountId: tokenTransfer.accountId._toProtobuf(),
                amount: tokenTransfer.amount,
                isApproval: tokenTransfer.isApproved,
            };
        });

        /**
         * @type {HashgraphProto.proto.NftTransfer[]}
         */
        const nftTransfers = this._nftTransfers.map((nftTransfer) => {
            return {
                senderAccountId: nftTransfer.senderAccountId._toProtobuf(),
                isApproval: nftTransfer.isApproved,
                receiverAccountId: nftTransfer.receiverAccountId._toProtobuf(),
                serialNumber: nftTransfer.serialNumber,
            };
        });

        const tokenTransferWithId = this._tokenTransfers.find(
            (tokenTransfer) => {
                return tokenTransfer.tokenId != null;
            },
        );
        const tokenId = tokenTransferWithId?.tokenId;

        const tokenTransferWithDecimals = this._tokenTransfers.find(
            (tokenTransfer) => {
                return tokenTransfer.expectedDecimals != null;
            },
        );
        const expectedDecimals = tokenTransferWithDecimals?.expectedDecimals;

        if (tokenId == null) {
            throw new Error("Token ID is required");
        }

        /**
         * @type {HashgraphProto.proto.TokenTransferList}
         */
        const tokenTransfersList = {
            transfers: tokenTransfers,
            nftTransfers: nftTransfers,
            token: tokenId._toProtobuf(),
            expectedDecimals: {
                value: expectedDecimals,
            },
        };

        return {
            tokenTransfers: [tokenTransfersList],
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

        const tokenTransfers = TokenTransfer._fromProtobuf(
            tokenAirdrop.tokenTransfers ?? [],
        );
        const nftTransfers = NftTransfer._fromProtobuf(
            tokenAirdrop.tokenTransfers ?? [],
        );

        return Transaction._fromProtobufTransactions(
            new AirdropTokenTransaction({
                nftTransfers: nftTransfers,
                tokenTransfers: tokenTransfers,
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
