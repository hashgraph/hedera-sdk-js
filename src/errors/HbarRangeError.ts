import { Hbar } from "../Hbar";

export class HbarRangeError extends Error {
    private amount: Hbar;

    public constructor(amount: Hbar) {
        super();
        this.message = `Hbar amount out of range: ${amount.toString()}`;
        this.name = "HbarRangeError";
        this.amount = amount;
    }
}
