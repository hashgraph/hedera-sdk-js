import StatusError from "./StatusError";

/**
 * @typedef {import("./Status").default} Status
 * @typedef {import("./TransactionId").default} TransactionId
 * @typedef {import("./TransactionReceipt").default} TransactionReceipt
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
