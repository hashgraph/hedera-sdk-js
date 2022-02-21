import Signer from "./Signer.js";

/**
 * @typedef {import("./LedgerId.js").default} LedgerId
 * @typedef {import("./SignerSignature.js").default} SignerSignature
 * @typedef {import("./Provider.js").default} Provider
 * @typedef {import("./Key.js").default} Key
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/Transaction.js").default} Transaction
 * @typedef {import("./transaction/TransactionResponse.js").default} TransactionResponse
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./account/AccountBalance.js").default} AccountBalance
 * @typedef {import("./account/AccountInfo.js").default} AccountInfo
 */

/**
 * @template {any} O
 * @typedef {import("./query/Query.js").default<O>} Query<O>
 */

/**
 * @abstract
 */
export default class Wallet extends Signer {
    /**
     * @protected
     */
    constructor() {
        super();
    }

    /**
     * @abstract
     * @returns {Provider}
     */
    getProvider() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @returns {Key}
     */
    getAccountKey() {
        throw new Error("not implemented");
    }
}
