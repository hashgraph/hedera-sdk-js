/**
 * @typedef {import("./Status").default} Status
 * @typedef {import("./TransactionId").default} TransactionId
 */

export default class StatusError extends Error {
    /**
     * @param {string} message
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     */
    constructor(props, message) {
        super(message);

        this.name = "StatusError";

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, StatusError);
        }
    }
}
