import StatusError from "./StatusError";

/**
 * @typedef {import("./Status").default} Status
 * @typedef {import("./transaction/TransactionId").default} TransactionId
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
