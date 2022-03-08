import Wallet from "./Wallet.js";
import LocalProvider from "./LocalProvider.js";
import PrivateKey from "./PrivateKey.js";
import AccountId from "./account/AccountId.js";
import TransactionId from "./transaction/TransactionId.js";
import SignerSignature from "./SignerSignature.js";
import AccountBalanceQuery from "./account/AccountBalanceQuery.js";
import AccountInfoQuery from "./account/AccountInfoQuery.js";
import AccountRecordsQuery from "./account/AccountRecordsQuery.js";

/**
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./Provider.js").default} Provider
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
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 * @typedef {import("./Executable.js").default<RequestT, ResponseT, OutputT>} Executable<RequestT, ResponseT, OutputT>
 */

export default class LocalWallet extends Wallet {
    constructor() {
        super();

        this.provider = new LocalProvider();

        if (
            process.env.OPERATOR_KEY == null ||
            process.env.OPERATOR_ID == null
        ) {
            throw new Error(
                "LocalWallet requires `OPERATOR_KEY` and `OPERATOR_ID` environment variables to be set"
            );
        }

        const key = PrivateKey.fromString(process.env.OPERATOR_KEY);

        this.publicKey = key.publicKey;

        /**
         * @type {(messasge: Uint8Array) => Promise<Uint8Array>}
         */
        this.signer = (message) => Promise.resolve(key.sign(message));

        this.accountId = AccountId.fromString(process.env.OPERATOR_ID);
    }

    /**
     * @returns {Provider}
     */
    getProvider() {
        return this.provider;
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
     * @returns {AccountId}
     */
    getAccountId() {
        return this.accountId;
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
        transaction.setNodeAccountIds(
            this.provider._client._network.getNodeAccountIdsForExecute()
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
