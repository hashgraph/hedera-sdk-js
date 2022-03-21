import "mocha";
import { expect } from "chai";

import { ExchangeRate } from "../../src/exports.js";

const exchangeRateSetBytes = Buffer.from(
    "0a1008b0ea0110b6b4231a0608f0bade9006121008b0ea01108cef231a060880d7de9006",
    "hex"
);

describe("ExchangeRate", function () {
    // it("fromBytes", function () {
       
    // });

    it("toBytes", function (){
        const rate = new ExchangeRate({
            hbarEquiv: 0,
            centEquiv: 0,
            expirationTime: new Date(1645714800000)
        });
        expect(ExchangeRate._fromProtobuf(rate).expirationTime.toUTCString()).to.equal("Thu, 24 Feb 2022 15:00:00 GMT");

        const rate2 = new ExchangeRate({
            hbarEquiv: 0,
            centEquiv: 0,
            expirationTime: "Thu, 24 Feb 2022 15:00:00 GMT"
        });
        console.log("#####DATA###",ExchangeRate._fromProtobuf(rate2).expirationTime);
        expect(ExchangeRate._fromProtobuf(rate2).expirationTime.toUTCString()).to.equal("Thu, 24 Feb 2022 15:00:00 GMT");
    });
});
