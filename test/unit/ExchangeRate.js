import "mocha";
import { ExchangeRate } from "../../src/index.js";
import * as symbols from "../../src/Symbols.js";

describe("ExchangeRate", function () {
    it("fromBytes", function () {
        const date = new Date("February 24, 2022 15:00:00 UTC");
        const exchangeRate = ExchangeRate[symbols.fromProtobuf](
            new ExchangeRate({
                expirationTime: date,
            })[symbols.toProtobuf]()
        );

        expect(exchangeRate.expirationTime.toString()).to.be.equal(
            date.toString()
        );
    });
});
