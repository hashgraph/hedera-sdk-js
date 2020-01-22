import { Hbar } from "../Hbar";

// @deprecate This error is no longer in use in the sdk. Use `MaxQueryPaymentExceededError` instead.
export class MaxPaymentExceededError extends Error {
    public readonly queryCost: Hbar;

    public constructor(queryCost: Hbar, maxQueryCost: Hbar) {
        console.warn("`MaxPaymentExceededError` is deprecated. Use `MaxQueryPaymentExceededError` instead");
        super(`query cost of ${queryCost.value()} HBAR exceeds max set on client: ${maxQueryCost.value()} HBAR`);

        this.name = "MaxPaymentExceededError";
        this.queryCost = queryCost;
    }
}
