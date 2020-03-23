import { ContractFunctionResult } from "../../../src/exports";
import * as hex from "@stablelib/hex";

describe("ContractFunctionResult", () => {
    const byteResult = hex.decode("00000000000000000000000000000000000000000000000000000000ffffffff" +
        "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" +
        "00000000000000000000000011223344556677889900aabbccddeeff00112233" +
        "48656c6c6f2c20776f726c642100000000000000000000000000000000000000" +
        "0000000000000000000000000000000000000000000000000000000000000014" +
        "48656c6c6f2c20776f726c642c20616761696e21000000000000000000000000");

    const byteResult2 = hex.decode("0000000000000000000000000000000000000000000000000000000000000020" +
        "0000000000000000000000000000000000000000000000000000000000000012" +
        "68656c6c6f2066726f6d20686564657261210000000000000000000000000000");

    const address = "11223344556677889900aabbccddeeff00112233";
    const address2 = "00000000000000000000000000000000ffffffff";

    it("deserializes correctly; ContractFunctionResult", () => {
        const result = new ContractFunctionResult(byteResult);

        expect(result.getBool()).toBe(true);
        expect(result.getInt32()).toBe(-1);
        expect(result._getBytes32(1)[ 0 ]).toBe(127);
        expect(result._getBytes32(2)[ 28 ]).toBe(0);
        expect(result._getBytes32(2)[ 29 ]).toBe(17);
        expect(result._getBytes32(2)[ 30 ]).toBe(34);
        expect(result._getBytes32(2)[ 31 ]).toBe(51);
        expect(result.getInt32(2)).toBe(1122867);
        expect(result.getAddress(2)).toStrictEqual(address);

        expect(result.getUint32()).toBe(4294967295);
        expect(result.getUint64().toString(10)).toStrictEqual("4294967295");
        expect(result.getUint256().toString(10)).toStrictEqual("4294967295");

        const result2 = new ContractFunctionResult(byteResult2);
        expect(result2.getInt32(0)).toBe(32);
        expect(result2.getString()).toBe("hello from hedera!");
    });
});
