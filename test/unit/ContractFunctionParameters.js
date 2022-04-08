import { ContractFunctionParameters } from "../../src/index.js";

import BigNumber from "bignumber.js";

describe("ContractFunctionParameters", function () {
    it("should convert number to BigNumber in addUint256()", function () {
        const contractFunctionParameters = new ContractFunctionParameters();

        const num = 111;
        const cfp = contractFunctionParameters.addUint256(num);

        const bigNum = BigNumber(111);
        contractFunctionParameters.addUint256(bigNum);

        expect(cfp._arguments[0].value).to.eql(cfp._arguments[1].value);
    });

    it("should convert number to BigNumber in addUint256Array()", function () {
        const contractFunctionParameters = new ContractFunctionParameters();

        const numArray = [111, 1112];

        const cfp = contractFunctionParameters.addUint256Array(numArray);

        const bigArray = [new BigNumber(111), new BigNumber(1112)];

        contractFunctionParameters.addUint256Array(bigArray);

        expect(cfp._arguments[0].value).to.eql(cfp._arguments[1].value);
    });
});
