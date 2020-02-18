import { Status } from "../Status";

/**
 * Class of errors for response codes returned from Hedera.
 */
export class HederaStatusError extends Error {
    public readonly status: Status;

    public constructor(status: Status) {
        super();
        this.message = `Hedera returned response code: ${status.toString()}`;
        this.status = status;
        this.name = "HederaStatusError";
    }
}
