import PrivateKey from "./PrivateKey.js";
import AccountId from "./account/AccountId.js";
import SignerSignature from "./SignerSignature.js";
import AccountBalanceQuery from "./account/AccountBalanceQuery.js";
import AccountInfoQuery from "./account/AccountInfoQuery.js";
import AccountRecordsQuery from "./account/AccountRecordsQuery.js";
import TransactionId from "./transaction/TransactionId.js";
import * as util from "./util.js";

/**
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @typedef {import("./Executable.js").default<RequestT, ResponseT, OutputT>} Executable<RequestT, ResponseT, OutputT>
 */

/**
 * @typedef {import("./Signer.js").Signer} Signer
 * @typedef {import("./Provider.js").Provider} Provider
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./Key.js").default} Key
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./transaction/TransactionRecord.js").default} TransactionRecord
 * @typedef {import("./account/AccountBalance.js").default} AccountBalance
 * @typedef {import("./account/AccountInfo.js").default} AccountInfo
 */

/**
 * @template {any} O
 * @typedef {import("./query/Query.js").default<O>} Query<O>
 */

/**
 * @implements {Signer}
 */
export default class Wallet {
    /**
     * @param {AccountId | string} accountId
     * @param {PrivateKey | string} privateKey
     * @param {Provider} provider
     */
    constructor(accountId, privateKey, provider) {
        const key =
            typeof privateKey === "string"
                ? PrivateKey.fromString(privateKey)
                : privateKey;

        this.publicKey = key.publicKey;
        /**
         * @type {(messasge: Uint8Array) => Promise<Uint8Array>}
         */
        this.signer = (message) => Promise.resolve(key.sign(message));
        this.provider = provider;
        this.accountId =
            typeof accountId === "string"
                ? AccountId.fromString(accountId)
                : accountId;
    }

    /**
     * @returns {Provider=}
     */
    getProvider() {
        return this.provider;
    }

    /**
     * @abstract
     * @returns {AccountId}
     */
    getAccountId() {
        return this.accountId;
    }

    /**
     * @returns {Key}
     */
    getAccountKey() {
        return this.publicKey;
    }

    /**
     * @returns {LedgerId?}
     */
    getLedgerId() {
        return this.provider.getLedgerId();
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        return this.provider.getNetwork();
    }

    /**
     * @abstract
     * @returns {string[]}
     */
    getMirrorNetwork() {
        return this.provider.getMirrorNetwork();
    }

    /**
     * @param {Uint8Array[]} messages
     * @returns {Promise<SignerSignature[]>}
     */
    async sign(messages) {
        const sigantures = [];

        for (const message of messages) {
            sigantures.push(
                new SignerSignature({
                    publicKey: this.publicKey,
                    signature: await this.signer(message),
                    accountId: this.accountId,
                })
            );
        }

        return sigantures;
    }

    /**
     * @returns {Promise<AccountBalance>}
     */
    getAccountBalance() {
        return this.sendRequest(
            new AccountBalanceQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo() {
        return this.sendRequest(
            new AccountInfoQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @abstract
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords() {
        return this.sendRequest(
            new AccountRecordsQuery().setAccountId(this.accountId)
        );
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    signTransaction(transaction) {
        return transaction.signWith(this.publicKey, this.signer);
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    checkTransaction(transaction) {
        const transactionId = transaction.transactionId;
        if (
            transactionId.accountId != null &&
            transactionId.accountId.compare(this.accountId) != 0
        ) {
            throw new Error(
                "transaction's ID constructed with a different account ID"
            );
        }

        const nodeAccountIds = (
            transaction.nodeAccountIds != null ? transaction.nodeAccountIds : []
        ).map((nodeAccountId) => nodeAccountId.toString());
        const network = Object.values(this.provider.getNetwork()).map(
            (nodeAccountId) => nodeAccountId.toString()
        );

        if (
            !nodeAccountIds.reduce(
                (previous, current) => previous && network.includes(current),
                true
            )
        ) {
            throw new Error(
                "Transaction already set node account IDs to values not within the current network"
            );
        }

        return Promise.resolve(transaction);
    }

    /**
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    populateTransaction(transaction) {
        transaction.setTransactionId(TransactionId.generate(this.accountId));
        const nodeAccountIds = Object.values(this.provider.getNetwork()).map(
            (id) => (typeof id === "string" ? AccountId.fromString(id) : id)
        );
        util.shuffle(nodeAccountIds);
        transaction.setNodeAccountIds(
            nodeAccountIds.slice(0, (nodeAccountIds.length + 3 - 1) / 3)
        );

        return Promise.resolve(transaction.freeze());
    }

    /**
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    sendRequest(request) {
        return this.provider.sendRequest(
            request._setOperatorWith(
                this.accountId,
                this.publicKey,
                this.signer
            )
        );
    }
}
