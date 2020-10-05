import ReceiptStatusError from "./ReceiptStatusError";
import Status from "./Status";
import TransactionReceiptQuery from "./TransactionReceiptQuery";
import TransactionRecordQuery from "./TransactionRecordQuery";

/**
 * @typedef {import("./client/Client").default<*, *>} Client
 * @typedef {import("./account/AccountId").default} AccountId
 * @typedef {import("./TransactionId").default} TransactionId
 * @typedef {import("./TransactionReceipt").default} TransactionReceipt
 * @typedef {import("./TransactionRecord").default} TransactionRecord
 */

export default class TransactionResponse {
    /**
     * @internal
     * @param {object} props
     * @param {AccountId} props.nodeId
     * @param {Uint8Array} props.transactionHash
     * @param {TransactionId} props.transactionId
     */
    constructor(props) {
        /** @readonly */
        this.nodeId = props.nodeId;

        /** @readonly */
        this.transactionHash = props.transactionHash;

        /** @readonly */
        this.transactionId = props.transactionId;

        Object.freeze(this);
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionReceipt>}
     */
    async getReceipt(client) {
        const receipt = await new TransactionReceiptQuery()
            .setTransactionId(this.transactionId)
            .setNodeAccountId(this.nodeId)
            .execute(client);

        if (receipt.status !== Status.Success) {
            throw new ReceiptStatusError({
                transactionReceipt: receipt,
                status: receipt.status,
                transactionId: this.transactionId,
            });
        }

        return receipt;
    }

    /**
     * @param {Client} client
     * @returns {Promise<TransactionRecord>}
     */
    async getRecord(client) {
        await this.getReceipt(client);

        return new TransactionRecordQuery()
            .setTransactionId(this.transactionId)
            .setNodeAccountId(this.nodeId)
            .execute(client);
    }
}
