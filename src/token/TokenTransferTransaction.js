import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import Long from "long";
import BigNumber from "bignumber.js";
import Transfer from "../Transfer.js";
import Hbar from "../Hbar.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoTransferTransactionBody} proto.ICryptoTransferTransactionBody
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
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
 * Transfers a new Hedera™ crypto-currency token.
 */
export default class TransferTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {(TransferTokensInput)[]} [props.tokenTransfers]
     * @param {(TransferHbarInput)[]} [props.hbarTransfers]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {Map<string, TransferTokenObject[]>}
         */
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this._tokenTransfers = new Map();

        for (const transfer of props.tokenTransfers != null ? props.tokenTransfers : []) {
            this.addTokenTransfer(
                transfer.tokenId,
                transfer.accountId,
                transfer.amount
            );
        }

        /**
         * @private
         * @type {Transfer[]}
         */
        this._hbarTransfers = [];

        if (props.hbarTransfers != null) {
            this._hbarTransfers = props.hbarTransfers.map((transfer) => {
                if (transfer instanceof Transfer) {
                    return transfer;
                } else {
                    const amount =
                        transfer.amount instanceof Hbar
                            ? transfer.amount
                            : new Hbar(transfer.amount);

                    return new Transfer({
                        accountId: transfer.accountId,
                        amount,
                    });
                }
            });
        }
    }

    /**
     * @internal
     * @param {proto.ITransactionBody} body
     * @returns {TransferTransaction}
     */
    static _fromProtobuf(body) {
        const cryptoTransfer = /** @type {proto.ICryptoTransferTransactionBody} */ (body.cryptoTransfer);

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

        const accountAmounts = cryptoTransfer.transfers != null ?
            cryptoTransfer.transfers.accountAmounts != null ?
                cryptoTransfer.transfers.accountAmounts :
                [] :
            [];



        for (const aa of accountAmounts) {
            transfers.addHbarTransfer(
                AccountId._fromProtobuf(/** @type {proto.IAccountID} */ (aa.accountID)),
                Hbar.fromTinybars(/** @type{Long} */ (aa.amount))
            );
        }

        return transfers;
    }

    /**
     * @returns {Map<string, TransferTokenObject[]>}
     */
    get tokenTransfers() {
        return this._tokenTransfers;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} accountId
     * @param {number | string | Long} amount
     * @returns {this}
     */
    addTokenTransfer(tokenId, accountId, amount) {
        this._requireNotFrozen();
        const id = tokenId.toString();
        const transfers = this._tokenTransfers.get(id);

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
            this._tokenTransfers.set(id, [transfer]);
        } else {
            transfers.push(transfer);
        }

        return this;
    }

    /**
     * @param {AccountId | string} accountId
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @returns {TransferTransaction}
     */
    addHbarTransfer(accountId, amount) {
        this._requireNotFrozen();
        this._tokenTransfers.push(
            new Transfer({
                accountId:
                    accountId instanceof AccountId
                        ? accountId
                        : AccountId.fromString(accountId),
                amount,
            })
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
        const tokenTransfers = [];

        for (const [tokenId, value] of this._tokenTransfers) {
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
    "cryptoTransfer",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TransferTransaction._fromProtobuf
);
