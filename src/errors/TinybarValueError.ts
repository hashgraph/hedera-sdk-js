import BigNumber from "bignumber.js";
import { Hbar } from "../Hbar";

// @deprecate This error is no longer in use in the sdk. Use `HbarRangeError` instead.
export class TinybarValueError extends Error {
    public readonly amount: BigNumber;

    public constructor(message: string, amount: number | BigNumber | Hbar) {
        console.warn("`TinybarValueError` has been renamed to `HbarRangeError`");
        let bnAmount;

        if (amount instanceof Hbar) {
            bnAmount = amount.asTinybar();
        } else if (amount instanceof BigNumber) {
            bnAmount = amount;
        } else {
            bnAmount = new BigNumber(amount);
        }

        super();

        this.message = `${message}: ${bnAmount.toString()}`;
        this.name = "TinybarValueError";
        this.amount = bnAmount;
    }
}
