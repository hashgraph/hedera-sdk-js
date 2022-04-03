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
import * as util from "../util.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.ICryptoAdjustAllowanceTransactionBody} HashgraphProto.proto.ICryptoAdjustAllowanceTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
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
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
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
            /** @type {HashgraphProto.proto.ICryptoAdjustAllowanceTransactionBody} */ (
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
     * @deprecated
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addHbarAllowance(spenderAccountId, amount) {
        const value = amount instanceof Hbar ? amount : new Hbar(amount);
        return this._adjustHbarAllowance(
            null,
            spenderAccountId,
            util.requireNotNegative(value)
        );
    }

    /**
     * @param {AccountId | string | null} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {Hbar} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    _adjustHbarAllowance(ownerAccountId, spenderAccountId, amount) {
        this._requireNotFrozen();

        this._hbarAllowances.push(
            new HbarAllowance({
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                ownerAccountId:
                    typeof ownerAccountId === "string"
                        ? AccountId.fromString(ownerAccountId)
                        : ownerAccountId,
                amount: amount,
            })
        );

        return this;
    }

    /**
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    grantHbarAllowance(ownerAccountId, spenderAccountId, amount) {
        const value = amount instanceof Hbar ? amount : new Hbar(amount);
        return this._adjustHbarAllowance(
            ownerAccountId,
            spenderAccountId,
            util.requireNotNegative(value)
        );
    }

    /**
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {number | string | Long | LongObject | BigNumber | Hbar} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    revokeHbarAllowance(ownerAccountId, spenderAccountId, amount) {
        const value = amount instanceof Hbar ? amount : new Hbar(amount);
        return this._adjustHbarAllowance(
            ownerAccountId,
            spenderAccountId,
            util.requireNotNegative(value).negated()
        );
    }

    /**
     * @returns {TokenAllowance[]}
     */
    get tokenAllowances() {
        return this._tokenAllowances;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addTokenAllowance(tokenId, spenderAccountId, amount) {
        return this._adjustTokenAllowance(
            tokenId,
            null,
            spenderAccountId,
            util.requireNotNegative(Long.fromValue(amount))
        );
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string | null} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    _adjustTokenAllowance(tokenId, ownerAccountId, spenderAccountId, amount) {
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
                ownerAccountId:
                    typeof ownerAccountId === "string"
                        ? AccountId.fromString(ownerAccountId)
                        : ownerAccountId,
                amount:
                    typeof amount === "number"
                        ? Long.fromNumber(amount)
                        : amount,
            })
        );

        return this;
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    grantTokenAllowance(tokenId, ownerAccountId, spenderAccountId, amount) {
        return this._adjustTokenAllowance(
            tokenId,
            ownerAccountId,
            spenderAccountId,
            util.requireNotNegative(Long.fromValue(amount))
        );
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {Long | number} amount
     * @returns {AccountAllowanceAdjustTransaction}
     */
    revokeTokenAllowance(tokenId, ownerAccountId, spenderAccountId, amount) {
        return this._adjustTokenAllowance(
            tokenId,
            ownerAccountId,
            spenderAccountId,
            util.requireNotNegative(Long.fromValue(amount))
        );
    }

    /**
     * @deprecated
     * @param {NftId | string} nftId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addTokenNftAllowance(nftId, spenderAccountId) {
        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;
        return this._adjustTokenNftAllowance(id, null, spenderAccountId);
    }

    /**
     * @param {NftId} nftId
     * @param {AccountId | string | null} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    _adjustTokenNftAllowance(nftId, ownerAccountId, spenderAccountId) {
        this._requireNotFrozen();

        const spender =
            typeof spenderAccountId === "string"
                ? AccountId.fromString(spenderAccountId)
                : spenderAccountId;
        const owner =
            typeof ownerAccountId === "string"
                ? AccountId.fromString(ownerAccountId)
                : ownerAccountId;
        let found = false;

        for (const allowance of this._nftAllowances) {
            if (
                allowance.tokenId.compare(nftId.tokenId) === 0 &&
                allowance.spenderAccountId != null &&
                allowance.spenderAccountId.compare(spender) === 0
            ) {
                if (allowance.serialNumbers != null) {
                    allowance.serialNumbers.push(nftId.serial);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            this._nftAllowances.push(
                new TokenNftAllowance({
                    tokenId: nftId.tokenId,
                    spenderAccountId: spender,
                    serialNumbers: [nftId.serial],
                    ownerAccountId: owner,
                    allSerials: false,
                })
            );
        }

        return this;
    }

    /**
     * @param {NftId | string} nftId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    grantTokenNftAllowance(nftId, ownerAccountId, spenderAccountId) {
        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;

        util.requireNotNegative(id.serial);

        return this._adjustTokenNftAllowance(
            id,
            ownerAccountId,
            spenderAccountId
        );
    }

    /**
     * @param {NftId | string} nftId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    revokeTokenNftAllowance(nftId, ownerAccountId, spenderAccountId) {
        const id = typeof nftId === "string" ? NftId.fromString(nftId) : nftId;

        util.requireNotNegative(id.serial);
        return this._adjustTokenNftAllowance(
            new NftId(id.tokenId, id.serial.negate()),
            ownerAccountId,
            spenderAccountId
        );
    }

    /**
     * @deprecated - use `grantTokenNftAllowanceAllSerials()` instead
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    addAllTokenNftAllowance(tokenId, spenderAccountId) {
        return this._adjustTokenNftAllowanceAllSerials(
            tokenId,
            null,
            spenderAccountId,
            true
        );
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    grantTokenNftAllowanceAllSerials(
        tokenId,
        ownerAccountId,
        spenderAccountId
    ) {
        return this._adjustTokenNftAllowanceAllSerials(
            tokenId,
            ownerAccountId,
            spenderAccountId,
            true
        );
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @returns {AccountAllowanceAdjustTransaction}
     */
    revokeTokenNftAllowanceAllSerials(
        tokenId,
        ownerAccountId,
        spenderAccountId
    ) {
        return this._adjustTokenNftAllowanceAllSerials(
            tokenId,
            ownerAccountId,
            spenderAccountId,
            false
        );
    }

    /**
     * @param {TokenId | string} tokenId
     * @param {AccountId | string | null} ownerAccountId
     * @param {AccountId | string} spenderAccountId
     * @param {boolean} allSerials
     * @returns {AccountAllowanceAdjustTransaction}
     */
    _adjustTokenNftAllowanceAllSerials(
        tokenId,
        ownerAccountId,
        spenderAccountId,
        allSerials
    ) {
        this._requireNotFrozen();

        this._nftAllowances.push(
            new TokenNftAllowance({
                tokenId:
                    typeof tokenId === "string"
                        ? TokenId.fromString(tokenId)
                        : tokenId,
                ownerAccountId:
                    ownerAccountId != null
                        ? typeof ownerAccountId === "string"
                            ? AccountId.fromString(ownerAccountId)
                            : ownerAccountId
                        : null,
                spenderAccountId:
                    typeof spenderAccountId === "string"
                        ? AccountId.fromString(spenderAccountId)
                        : spenderAccountId,
                serialNumbers: null,
                allSerials,
            })
        );

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        this._hbarAllowances.map((allowance) =>
            allowance._validateChecksums(client)
        );
        this._tokenAllowances.map((allowance) =>
            allowance._validateChecksums(client)
        );
        this._nftAllowances.map((allowance) =>
            allowance._validateChecksums(client)
        );
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.crypto.adjustAllowances(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "cryptoAdjustAllowance";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.ICryptoAdjustAllowanceTransactionBody}
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
