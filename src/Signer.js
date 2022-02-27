/**
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./SignerSignature.js").default} SignerSignature
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./transaction/TransactionRecord.js").default} TransactionRecord
 * @typedef {import("./account/AccountId.js").default} AccountId
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

/**
 * @abstract
 */
export default class Signer {
    /**
     * @protected
     */
    constructor() {}

    /**
     * @abstract
     * @returns {LedgerId?}
     */
    getLedgerId() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {AccountId}
     */
    getAccountId() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {{[key: string]: (string | AccountId)}}
     */
    getNetwork() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {string[]}
     */
    getMirrorNetwork() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Uint8Array[]} messages
     * @returns {Promise<SignerSignature[]>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sign(messages) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {Promise<AccountBalance>}
     */
    getAccountBalance() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {Promise<AccountInfo>}
     */
    getAccountInfo() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {Promise<TransactionRecord[]>}
     */
    getAccountRecords() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signTransaction(transaction) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkTransaction(transaction) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Transaction} transaction
     * @returns {Promise<Transaction>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    populateTransaction(transaction) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @template RequestT
     * @template ResponseT
     * @template OutputT
     * @param {Executable<RequestT, ResponseT, OutputT>} request
     * @returns {Promise<OutputT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendRequest(request) {
        throw new Error("not implemented");
    }
}
