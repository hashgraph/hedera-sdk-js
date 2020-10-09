import StatusError from "./StatusError.js";

/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./transaction/TransactionReceipt.js").default} TransactionReceipt
 */

export default class ReceiptStatusError extends StatusError {
    /**
     * @param {object} props
     * @param {TransactionReceipt} props.transactionReceipt
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     */
    constructor(props) {
        super(
            props,
            `receipt for transaction ${props.transactionId.toString()} contained error status ${props.status.toString()}`
        );

        /**
         * @type {TransactionReceipt}
         * @readonly
         */
        this.transactionReceipt = props.transactionReceipt;
    }
}
