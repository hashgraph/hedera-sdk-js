/**
 * @typedef {import("./Hbar.js").default} Hbar
 */

export default class MaxQueryPaymentExceeded extends Error {
    /**
     * @param {Hbar} queryCost
     * @param {Hbar} maxQueryPayment
     */
    constructor(queryCost, maxQueryPayment) {
        super();

        this.message = `query cost of ${queryCost.toString()} HBAR exceeds max set on client: ${maxQueryPayment.toString()} HBAR`;
        this.name = "MaxQueryPaymentExceededError";
        this.queryCost = queryCost;
        this.maxQueryPayment = maxQueryPayment;
    }
}
