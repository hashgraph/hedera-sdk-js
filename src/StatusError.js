/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

export default class StatusError extends Error {
    /**
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     * @param {string} message
     */
    constructor(props, message) {
        super(message);

        this.name = "StatusError";

        this.status = props.status;

        this.transactionId = props.transactionId;

        this.message = message;

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, StatusError);
        }
    }
}
