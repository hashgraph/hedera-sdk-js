import { Hbar } from "../hbar";

export class HbarRangeError extends Error {
    /**
     * @param {Hbar} _amount
     */
    constructor(_amount) {
        super();
        this.message = `Hbar _amount out of range: ${_amount.toString()}`;
        this.name = "HbarRangeError";
        this._amount = _amount;
    }
}
