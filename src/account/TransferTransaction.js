import Hbar from "../Hbar.js";
import TokenId from "../token/TokenId.js";
import AccountId from "./AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";
import TokenTransferMap from "./TokenTransferMap.js";
import HbarTransferMap from "./HbarTransferMap.js";
import TokenNftTransferMap from "./TokenNftTransferMap.js";

/**
 * @typedef {import("../long.js").LongObject} LongObject
 * @typedef {import("bignumber.js").default} BigNumber
 */

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoTransferTransactionBody} proto.ICryptoTransferTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").IAccountAmount} proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").ITokenTransferList} proto.ITokenTransferList
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * @typedef {object} TransferTokensInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} accountId
 * @property {Long | number} amount
 */

/**
 * @typedef {object} TransferTokenObject
 * @property {TokenId} tokenId
 * @property {AccountId} accountId
 * @property {Long} amount
 */

/**
 * @typedef {object} TransferHbarInput
 * @property {AccountId | string} accountId
 * @property {number | string | Long | BigNumber | Hbar} amount
 */

/**
 * @typedef {object} TransferNftInput
 * @property {TokenId | string} tokenId
 * @property {AccountId | string} sender
 * @property {AccountId | string} recipient
 * @property {Long | number} serial
 */

/**
 * Transfers a new Hedera™ crypto-currency token.
 */
export default class TransferTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {(TransferTokensInput)[]} [props.tokenTransfers]
     * @param {(TransferHbarInput)[]} [props.hbarTransfers]
     * @param {(TransferNftInput)[]} [props.nftTransfers]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {TokenTransferMap}
         */
        this._tokenTransfers = new TokenTransferMap();

        /**
         * @private
         * @type {HbarTransferMap}
         */
        this._hbarTransfers = new HbarTransferMap();

        /**
         * @private
         * @type {TokenNftTransferMap}
         */
        this._nftTransfers = new TokenNftTransferMap();

        this.setMaxTransactionFee(new Hbar(1));

        for (const transfer of props.tokenTransfers != null
            ? props.tokenTransfers
            : []) {
            this.addTokenTransfer(
                transfer.tokenId,
                transfer.accountId,
                transfer.amount
            );
        }

        for (const transfer of props.hbarTransfers != null
            ? props.hbarTransfers
            : []) {
            this.addHbarTransfer(transfer.accountId, transfer.amount);
        }

        for (const transfer of props.nftTransfers != null
            ? props.nftTransfers
            : []) {
            this.addNftTransfer(
                transfer.tokenId,
                transfer.serial,
                transfer.sender,
                transfer.recipient
            );
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {TransferTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const cryptoTransfer =
            /** @type {proto.ICryptoTransferTransactionBody} */ (
                body.cryptoTransfer
            );

        const transfers = new TransferTransaction();
        for (const list of cryptoTransfer.tokenTransfers != null
            ? cryptoTransfer.tokenTransfers
            : []) {
            const tokenId = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (list.token)
            );

            for (const transfer of list.transfers != null
                ? list.transfers
                : []) {
                transfers.addTokenTransfer(
                    tokenId,
                    AccountId._fromProtobuf(
                        /** @type {proto.IAccountID} */ (transfer.accountID)
                    ),
                    /** @type {Long} */ (transfer.amount)
                );
            }
        }

        const accountAmounts =
            cryptoTransfer.transfers != null
                ? cryptoTransfer.transfers.accountAmounts != null
                    ? cryptoTransfer.transfers.accountAmounts
                    : []
                : [];

        for (const aa of accountAmounts) {
            transfers.addHbarTransfer(
                AccountId._fromProtobuf(
                    /** @type {proto.IAccountID} */ (aa.accountID)
                ),
                Hbar.fromTinybars(/** @type {Long} */ (aa.amount))
            );
        }

        return Transaction._fromProtobufTransactions(
            transfers,
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {TokenTransferMap}
     */
    get tokenTransfers() {
        return this._tokenTransfers;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {number | Long} amount
     * @returns {this}
     */
    addTokenTransfer(tokenId, accountId, amount) {
        this._requireNotFrozen();

        this._tokenTransfers.__set(
            tokenId instanceof TokenId ? tokenId : TokenId.fromString(tokenId),
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId),
            amount instanceof Long ? amount : Long.fromNumber(amount)
        );

        return this;
    }

    /**
     * @returns {HbarTransferMap}
     */
    get hbarTransfers() {
        return this._hbarTransfers;
    }

    /**
     * @internal
     * @param {AccountId | string} accountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {TransferTransaction}
     */
    addHbarTransfer(accountId, amount) {
        this._requireNotFrozen();
        this._hbarTransfers._set(
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId),
            amount instanceof Hbar ? amount : new Hbar(amount)
        );

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateIdNetworks(client) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [a, _] of this._hbarTransfers) {
            if (a != null) {
                a.validate(client);
            }
        }

        for (const [tokenId, transfers] of this._tokenTransfers) {
            if (tokenId != null) {
                tokenId.validate(client);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [a, _] of transfers) {
                if (a != null) {
                    a.validate(client);
                }
            }
        }
    }

    /**
     * @returns {TokenNftTransferMap}
     */
    get nftTransfers() {
        return this._nftTransfers;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {Long | number} serial
     * @param {AccountId | string} sender
     * @param {AccountId | string} recipient
     * @returns {TransferTransaction}
     */
    addNftTransfer(tokenId, serial, sender, recipient) {
        this._requireNotFrozen();
        this._nftTransfers.__set(
            typeof tokenId === "string" ? TokenId.fromString(tokenId) : tokenId,
            {
                serial:
                    typeof serial === "number"
                        ? Long.fromNumber(serial)
                        : serial,
                sender:
                    typeof sender === "string"
                        ? AccountId.fromString(sender)
                        : sender,
                recipient:
                    typeof recipient === "string"
                        ? AccountId.fromString(recipient)
                        : recipient,
            }
        );

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
        return channel.crypto.cryptoTransfer(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoTransfer";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoTransferTransactionBody}
     */
    _makeTransactionData() {
        /** @type {proto.ITokenTransferList[]} */
        const tokenTransfers = [];
        const hbarTransfers = [];

        for (const [tokenId, value] of this._tokenTransfers) {
            const transfers = [];
            for (const [accountId, amount] of value) {
                transfers.push({
                    accountID: accountId._toProtobuf(),
                    amount: amount,
                });
            }

            tokenTransfers.push({
                token: tokenId._toProtobuf(),
                transfers,
            });
        }

        for (const [tokenId, value] of this._nftTransfers) {
            let found = false;

            // eslint-disable-next-line ie11/no-loop-func
            const nftTransfers = value.map((transfer) => {
                return {
                    senderAccountID: transfer.sender._toProtobuf(),
                    receiverAccountID: transfer.recipient._toProtobuf(),
                    serialNumber: transfer.serial,
                };
            });

            for (const tokenTransfer of tokenTransfers) {
                if (
                    tokenTransfer.token != null &&
                    tokenTransfer.token.shardNum === tokenId.shard &&
                    tokenTransfer.token.realmNum === tokenId.realm &&
                    tokenTransfer.token.tokenNum === tokenId.num
                ) {
                    tokenTransfer.nftTransfers = nftTransfers;
                }
            }

            if (!found) {
                tokenTransfers.push({
                    token: tokenId._toProtobuf(),
                    nftTransfers,
                });
            }
        }

        for (const [accountId, value] of this._hbarTransfers) {
            hbarTransfers.push({
                accountID: accountId._toProtobuf(),
                amount: value.toTinybars(),
            });
        }

        return {
            transfers: {
                accountAmounts: hbarTransfers,
            },
            tokenTransfers,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoTransfer",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransferTransaction._fromProtobuf
);
