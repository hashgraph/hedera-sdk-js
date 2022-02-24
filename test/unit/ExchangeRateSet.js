import "mocha";
import { expect } from "chai";

import {
    ExchangeRateSet
} from "../../src/exports.js";

const exchangeRateSetBytes = Buffer.from("0a1008b0ea0110b6b4231a0608f0bade9006121008b0ea01108cef231a060880d7de9006", "hex");

describe("ExchangeRateSet", function () {
    it("fromBytes", function () {
        const exchangeRateSet = ExchangeRateSet.fromBytes(exchangeRateSetBytes);

        expect(exchangeRateSet.currentRate.cents).to.equal(580150);
        expect(exchangeRateSet.currentRate.hbars).to.equal(30000);
        const currentExpirationTime = new Date("January 20, 1970 01:08:34 UTC");
        currentExpirationTime.setMilliseconds(800);
        expect(exchangeRateSet.currentRate.expirationTime).to.deep.equal(currentExpirationTime);

        expect(exchangeRateSet.nextRate.cents).to.equal(587660);
        expect(exchangeRateSet.nextRate.hbars).to.equal(30000);
        const nextExpirationTime = new Date("January 20, 1970 01:08:38 UTC");
        nextExpirationTime.setMilliseconds(400);
        expect(exchangeRateSet.nextRate.expirationTime).to.deep.equal(nextExpirationTime);
    });
});
