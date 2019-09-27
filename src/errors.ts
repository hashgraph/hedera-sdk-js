import { ResponseCodeEnum } from "./generated/ResponseCode_pb";
import BigNumber from "bignumber.js";
import { Hbar } from "./Hbar";

export { ResponseCodeEnum } from "./generated/ResponseCode_pb";

export type ResponseCode = number;

const responseCodeNames: { [code: number]: string } = Object.entries(ResponseCodeEnum)
    .reduce((map, [ name, code ]) => ({ ...map, [ code ]: name }), {});

/** Get the name of a response code from its number code. */
export const getResponseCodeName = (code: ResponseCode): string | undefined => responseCodeNames[ code ];

/**
 * Class of errors for response codes returned from Hedera.
 */
export class HederaError extends Error {
    /** The numerical code */
    public readonly code: ResponseCode;
    /** The name of the code from the protobufs, or 'UNKNOWN' */
    public readonly codeName: string;

    public constructor(code: ResponseCode) {
        const codeName = getResponseCodeName(code) || "UNKNOWN";
        super(`Hedera returned response code: ${codeName} (${code})`);
        this.code = code;
        this.codeName = codeName;
    }
}

export function isPrecheckCodeOk(code: ResponseCode, unknownOk = false): boolean {
    switch (code) {
        case ResponseCodeEnum.SUCCESS:
        case ResponseCodeEnum.OK:
            return true;
        case ResponseCodeEnum.UNKNOWN:
            return unknownOk;
        default:
            return false;
    }
}

export function throwIfExceptional(code: ResponseCode, unknownOk = false): void {
    if (!isPrecheckCodeOk(code, unknownOk)) {
        throw new HederaError(code);
    }
}

export class ValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        super(`${className} failed validation:\n${errors.join("\n")}`);
    }
}

export class MaxPaymentExceededException extends Error {
    public readonly queryCost: Hbar;

    public constructor(queryCost: Hbar, maxQueryCost: Hbar) {
        super(`query cost of ${queryCost.value()} HBAR exceeds max set on client: ${maxQueryCost.value()} HBAR`);
        this.queryCost = queryCost;
    }
}

export class TinybarValueError extends Error {
    public readonly amount: BigNumber;

    public constructor(message: string, amount: number | BigNumber | Hbar) {
        let bnAmount;

        if (amount instanceof Hbar) {
            bnAmount = amount.asTinybar();
        } else if (amount instanceof BigNumber) {
            bnAmount = amount;
        } else {
            bnAmount = new BigNumber(amount);
        }

        super(`${message}: ${bnAmount.toString()}`);
        this.amount = bnAmount;
    }
}
