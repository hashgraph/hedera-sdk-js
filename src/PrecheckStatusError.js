import StatusError from "./StatusError.js";

/**
 * @typedef {import("./Status.js").default} Status
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

export default class PrecheckStatusError extends StatusError {
    /**
     * @param {object} props
     * @param {Status} props.status
     * @param {TransactionId} props.transactionId
     */
    constructor(props) {
        super(
            props,
            `transaction ${props.transactionId.toString()} failed precheck with status ${props.status.toString()}`
        );
    }
}
