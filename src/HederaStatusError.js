import Status from "./Status";

/**
 * Class of errors for response codes returned from Hedera.
 */
export default class HederaStatusError extends Error {
    /**
     * @param {Status} status
     */
    constructor(status) {
        super();
        this.message = `Hedera returned response code: ${status.toString()}`;
        /**
         * @type {Status}
         */
        this.status = status;
        this.name = "HederaStatusError";
    }
}
