export default class HederaPreCheckStatusError {
    /**
     * @param {object} props
     * @param {import("./Status").default} props.status
     * @param {import("./TransactionId").default} [props.transactionId]
     */
    constructor(props) {
        this.status = props.status;
        this.transactionId = props.transactionId;
    }
}
