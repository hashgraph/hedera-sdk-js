import { ContractFunctionResult } from "../../src/exports";
import { mockClient, mockTransaction } from "../MockClient";
import { decodeHex } from "../../src/crypto/util";

describe("ContractFunctionResult", () => {
    const byteResult = decodeHex(
          "00000000000000000000000000000000000000000000000000000000ffffffff"
        + "7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
        + "00000000000000000000000011223344556677889900aabbccddeeff00112233"
        + "48656c6c6f2c20776f726c642100000000000000000000000000000000000000"
        + "0000000000000000000000000000000000000000000000000000000000000014"
        + "48656c6c6f2c20776f726c642c20616761696e21000000000000000000000000"
    );

    const address = decodeHex(
        "11223344556677889900aabbccddeeff00112233"
    );

    const result = new ContractFunctionResult(
        { shard: 0, realm: 0, contract: 1 },
        byteResult,
        "",
        new Uint8Array(),
        10,
        []
    );

    it("deserializes correctly; ContractFunctionResult", () => {
        expect(result.getBool(0)).toBe(true);
        expect(result.getUint32(0)).toBe(4294967295);
        expect(result.getBytes32(1)[0]).toBe(127);
        expect(result.getBytes32(2)[28]).toBe(0);
        expect(result.getBytes32(2)[29]).toBe(17);
        expect(result.getBytes32(2)[30]).toBe(34);
        expect(result.getBytes32(2)[31]).toBe(51);
        expect(result.getUint32(2)).toBe(1122867);
        expect(result.getAddress(2)).toStrictEqual(address);
    });
});
