import { Status } from "../Status";

export type ResponseCode = number;

/**
 * Class of errors for response codes returned from Hedera.
 * @deprecate This error is no longer in use in the sdk. `HederaStatusError` is used instead.
 */
export class HederaError extends Error {
    /** The numerical code */
    public readonly code: ResponseCode;
    /** The name of the code from the protobufs, or 'UNKNOWN STATUS CODE (4120)' */
    public readonly codeName: string;

    public constructor(code: ResponseCode) {
        console.warn("`HederaError` has been renamed to `HederaStatusError`");

        const codeName = Status._fromCode(code).toString();
        super();

        this.message = `Hedera returned response code: ${codeName} (${code})`;
        this.name = "HederaError";
        this.code = code;
        this.codeName = codeName;
    }
}
