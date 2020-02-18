import { Hbar } from "../Hbar";

export class MaxQueryPaymentExceededError extends Error {
    public readonly queryCost: Hbar;
    public readonly maxQueryPayment: Hbar;

    public constructor(queryCost: Hbar, maxQueryPayment: Hbar) {
        super();

        this.message = `query cost of ${queryCost.value()} HBAR exceeds max set on client: ${maxQueryPayment.value()} HBAR`;
        this.name = "MaxQueryPaymentExceededError";
        this.queryCost = queryCost;
        this.maxQueryPayment = maxQueryPayment;
    }
}

