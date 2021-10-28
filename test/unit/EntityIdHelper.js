import BigNumber from "bignumber.js";
import Long from "long";
import * as EntityIdHelper from "../src/EntityIdHelper.js";

describe("EntityIdHelper", function () {
    it("should return hex encoded solidity address using toSolidityAddress", function () {
        let address = EntityIdHelper.toSolidityAddress([
            new Long(1),
            new Long(1),
            new Long(1),
        ]);
        const addressExpected = "0000000100000000000000010000000000000001";
        expect(address).to.eql(addressExpected);

        address = EntityIdHelper.toSolidityAddress([1, 1, 1]);
        expect(address).to.eql(addressExpected);

        address = EntityIdHelper.toSolidityAddress([
            new BigNumber(1),
            new BigNumber(1),
            new BigNumber(1),
        ]);
        expect(address).to.eql(addressExpected);

        address = EntityIdHelper.toSolidityAddress(["1", "1", "1"]);
        expect(address).to.eql(addressExpected);
    });

    it("should prove to|fromSolidityAddress are reversible", function () {
        const arrayLong = [new Long(11),new Long(12),new Long(13)];

        console.log(EntityIdHelper.toSolidityAddress(arrayLong));

        const address = EntityIdHelper.fromSolidityAddress(EntityIdHelper.toSolidityAddress(arrayLong));
        

        // console.log(address);
        

        expect(address).to.eql(arrayLong);
    });
});
