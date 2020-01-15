import { ResponseCodeEnum } from "./generated/ResponseCode_pb";
import { Hbar } from "./Hbar";
import { Status } from "./Status";

export { ResponseCodeEnum } from "./generated/ResponseCode_pb";

export type ResponseCode = number;

const responseCodeNames: { [code: number]: string } = Object.entries(ResponseCodeEnum)
    .reduce((map, [ name, code ]) => ({ ...map, [ code ]: name }), {});

/** Get the name of a response code from its number code. */
/* eslint-disable-next-line max-len */
export const getResponseCodeName = (code: ResponseCode): string | null => responseCodeNames[ code ];

/**
 * Class of errors for response codes returned from Hedera.
 */
export class HederaStatusError extends Error {
    public readonly status: Status;

    public constructor(status: Status) {
        super(`Hedera returned response code: ${status.toString()}`);
        this.status = status;
        this.name = "HederaStatusError";
    }
}

export class ValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        super(`${className} failed validation:\n${errors.join("\n")}`);

        this.name = "ValidationError";
    }
}

export class MaxQueryPaymentExceededError extends Error {
    public readonly queryCost: Hbar;

    public constructor(queryCost: Hbar, maxQueryCost: Hbar) {
        super(`query cost of ${queryCost.value()} HBAR exceeds max set on client: ${maxQueryCost.value()} HBAR`);

        this.name = "MaxQueryPaymentExceededError";
        this.queryCost = queryCost;
    }
}

export class BadKeyError extends Error {
    public constructor() {
        super("Failed to parse correct key");
        this.name = "BadKeyError";
    }
}

export class HbarRangeError extends Error {
    private amount: Hbar;

    public constructor(amount: Hbar) {
        super(`Hbar amount out of range: ${amount.toString()}`);
        this.name = "HbarRangeError";
        this.amount = amount;
    }
}
