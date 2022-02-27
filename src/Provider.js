/**
 * @typedef {import("./LedgerId.js").default} LedgerId
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
 * @template O
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
export default class Provider {
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
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountBalance>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountBalance(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {AccountId | string} accountId
     * @returns {Promise<AccountInfo>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountInfo(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {AccountId | string} accountId
     * @returns {Promise<TransactionRecord[]>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAccountRecords(accountId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {TransactionId | string} transactionId
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getTransactionReceipt(transactionId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {TransactionResponse} response
     * @returns {Promise<TransactionReceipt>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    waitForReceipt(response) {
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
