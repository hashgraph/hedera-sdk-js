import Hbar from "./Hbar.js";

export default class HbarRangeError extends Error {
    /**
     * @param {Hbar} amount
     */
    constructor(amount) {
        super();
        this.message = `Hbar amount out of range: ${amount.toString()}`;
        this.name = "HbarRangeError";


        /**
         * @type {Hbar}
         */
        this.amount = amount;
    }
}
