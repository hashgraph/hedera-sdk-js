import BigNumber from "bignumber.js";
import {ContractFunctionResult} from "../../src/contract/ContractFunctionResult";

describe("Uint8Array to BigNumber", () => {
    const bytes = new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1, 1
    ]);

   it("correctly represents Uint8Array as BigNumber", () => {
       let bn = new BigNumber(0);
       const hex = Buffer.from(bytes).toString("hex");
       bn = bn.plus(hex, 16);

       expect(bn.toString()).toStrictEqual("257");
   });

    it("can read BigNumber correctly", () => {
        const result = new ContractFunctionResult(
            {shard: 0, realm: 0, contract: 4},
            bytes,
            "",
            bytes,
            0,
            []
        );

        expect(result.getBigNumber().toString()).toStrictEqual("257");
    });

    it("can read number correctly", () => {
        const result = new ContractFunctionResult(
            {shard: 0, realm: 0, contract: 4},
            bytes,
            "",
            bytes,
            0,
            []
        );

        expect(result.getNumber().toString()).toStrictEqual("257");
    });

    it("can read boolean correctly", () => {
        const result = new ContractFunctionResult(
            {shard: 0, realm: 0, contract: 4},
            bytes,
            "",
            bytes,
            0,
            []
        );

        expect(result.getBool().toString()).toStrictEqual("true");
    });
});
