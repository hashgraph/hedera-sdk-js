import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import AccountId from "./AccountId.js";
import TokenId from "../token/TokenId.js";
import NftId from "../token/NftId.js";
import Long from "long";
import Hbar from "../Hbar.js";
import HbarAllowance from "./HbarAllowance.js";
import TokenAllowance from "./TokenAllowance.js";
import TokenNftAllowance from "./TokenNftAllowance.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").ICryptoAdjustAllowanceTransactionBody} proto.ICryptoAdjustAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../long.js").LongObject} LongObject
 */

/**
 * Change properties for the given account.
 */
export default class AccountAllowanceAdjustTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {HbarAllowance[]} [props.hbarAllowances]
     * @param {TokenAllowance[]} [props.tokenAllowances]
     * @param {TokenNftAllowance[]} [props.nftAllowances]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {HbarAllowance[]}
         */
        this._hbarAllowances =
            props.hbarAllowances != null ? props.hbarAllowances : [];

        /**
         * @private
         * @type {TokenAllowance[]}
         */
        this._tokenAllowances =
            props.tokenAllowances != null ? props.tokenAllowances : [];

        /**
         * @private
         * @type {TokenNftAllowance[]}
         */
        this._nftAllowances =
            props.nftAllowances != null ? props.nftAllowances : [];
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {AccountAllowanceAdjustTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const allowanceAdjust =
            /** @type {proto.ICryptoAdjustAllowanceTransactionBody} */ (
                body.cryptoAdjustAllowance
            );

        return Transaction._fromProtobufTransactions(
            new AccountAllowanceAdjustTransaction({
                hbarAllowances: (allowanceAdjust.cryptoAllowances != null
                    ? allowanceAdjust.cryptoAllowances
                    : []
                ).map((adjust) => HbarAllowance._fromProtobuf(adjust)),
                tokenAllowances: (allowanceAdjust.tokenAllowances != null
                    ? allowanceAdjust.tokenAllowances
                    : []
                ).map((adjust) => TokenAllowance._fromProtobuf(adjust)),
                nftAllowances: (allowanceAdjust.nftAllowances != null
                    ? allowanceAdjust.nftAllowances
                    : []
                ).map((adjust) => TokenNftAllowance._fromProtobuf(adjust)),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {HbarAllowance[]}
     */
    get hbarAllowances() {
        return this._hbarAllowances;
    }

    /**
     * @internal
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addHbarAllowance(spenderAccountId, amount) {
        this._requireNotFrozen();

        this._hbarAllowances.push(
            new HbarAllowance({
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                amount: amount instanceof Hbar ? amount : new Hbar(amount),
                ownerAccountId: null,
            })
        );

        return this;
    }

    /**
     * @returns {TokenAllowance[]}
     */
    get tokenAllowances() {
        return this._tokenAllowances;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addTokenAllowance(tokenId, spenderAccountId, amount) {
        this._requireNotFrozen();

        this._tokenAllowances.push(
            new TokenAllowance({
                tokenId:
                    typeof tokenId === "string"
                        ? TokenId.fromString(tokenId)
                        : tokenId,
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                amount:
                    typeof amount === "number"
                        ? Long.fromNumber(amount)
                        : amount,
                ownerAccountId: null,
            })
        );

        return this;
    }

    /**
     * @internal
     * @param {NftId | string} nftId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addTokenNftAllowance(nftId, spenderAccountId) {
        this._requireNotFrozen();

        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;
        const spender =
            typeof spenderAccountId === "string"
                ? AccountId.fromString(spenderAccountId)
                : spenderAccountId;
        let found = false;

        for (const allowance of this._nftAllowances) {
            if (
                allowance.tokenId.compare(id.tokenId) === 0 &&
                allowance.spenderAccountId.compare(spender) === 0
            ) {
                if (allowance.serialNumbers != null) {
                    allowance.serialNumbers.push(id.serial);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            this._nftAllowances.push(
                new TokenNftAllowance({
                    tokenId: id.tokenId,
                    spenderAccountId: spender,
                    serialNumbers: [id.serial],
                    ownerAccountId: null,
                })
            );
        }

        return this;
    }

    /**
     * @internal
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addAllTokenNftAllowance(tokenId, spenderAccountId) {
        this._requireNotFrozen();

        this._nftAllowances.push(
            new TokenNftAllowance({
                tokenId:
                    typeof tokenId === "string"
                        ? TokenId.fromString(tokenId)
                        : tokenId,
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                serialNumbers: null,
                ownerAccountId: null,
            })
        );

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        this._hbarAllowances.map((adjust) =>
            adjust.spenderAccountId.validateChecksum(client)
        );
        this._tokenAllowances.map((adjust) => {
            adjust.tokenId.validateChecksum(client);
            adjust.spenderAccountId.validateChecksum(client);
        });
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.adjustAllowance(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoAdjustAllowance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ICryptoAdjustAllowanceTransactionBody}
     */
    _makeTransactionData() {
        return {
            cryptoAllowances: this._hbarAllowances.map((adjust) =>
                adjust._toProtobuf()
            ),
            tokenAllowances: this._tokenAllowances.map((adjust) =>
                adjust._toProtobuf()
            ),
            nftAllowances: this._nftAllowances.map((adjust) =>
                adjust._toProtobuf()
            ),
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `AccountAllowanceAdjustTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "cryptoAdjustAllowance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    AccountAllowanceAdjustTransaction._fromProtobuf
);
