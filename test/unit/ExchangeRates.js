import "mocha";
import { expect } from "chai";
import Long from "long";
import { ExchangeRates, ExchangeRate } from "../../src/exports.js";

const exchangeRateSetBytes = Buffer.from(
    "0a1008b0ea0110b6b4231a0608f0bade9006121008b0ea01108cef231a060880d7de9006",
    "hex"
);

describe("ExchangeRates", function () {
    it("fromBytes", function () {
        const exchangeRateSet = ExchangeRates.fromBytes(exchangeRateSetBytes);

        expect(exchangeRateSet.currentRate.cents).to.equal(580150);
        expect(exchangeRateSet.currentRate.hbars).to.equal(30000);
        const currentExpirationTime = new Date("January 20, 1970 01:08:34 UTC");
        currentExpirationTime.setMilliseconds(800);
        expect(exchangeRateSet.currentRate.expirationTime.valueOf()).to.equal(
            currentExpirationTime.valueOf()
        );
        let exchangeRate = 19.338333333333335;
        expect(exchangeRate).to.equal(
            exchangeRateSet.currentRate.exchangeRateInCents
        );

        expect(exchangeRateSet.nextRate.cents).to.equal(587660);
        expect(exchangeRateSet.nextRate.hbars).to.equal(30000);
        const nextExpirationTime = new Date("January 20, 1970 01:08:38 UTC");
        nextExpirationTime.setMilliseconds(400);
        expect(exchangeRateSet.nextRate.expirationTime.valueOf()).to.deep.equal(
            nextExpirationTime.valueOf()
        );
        exchangeRate = 19.588666666666665;
        expect(exchangeRate).to.equal(
            exchangeRateSet.nextRate.exchangeRateInCents
        );
    });
});

describe("ExchangeRate", function () {
    it("fromBytes", function () {
         const expirationTime = new Date("February 24, 2022 15:00:00 UTC");
         const props = {
             expirationTime: expirationTime,
           }
         const exchangeRate = new ExchangeRate(props);
         expect(exchangeRate._toProtobuf().expirationTime.seconds).to.deep.equal(Long.fromValue({ low: 1645714800, high: 0, unsigned: false }));
    });
});
