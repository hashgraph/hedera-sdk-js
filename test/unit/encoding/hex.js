import * as hex from "../../../src/encoding/hex.js";

describe("hex", () => {
    const bytes1 = Uint8Array.from([1, 2, 3]);
    const bytes2 = Uint8Array.from([
        196, 68, 204, 227, 164, 45, 145, 146, 251, 20, 236, 132, 224, 84,
        43, 221, 248, 153, 177, 132, 157, 188, 209, 157, 49, 221, 103, 9,
        63, 139, 112, 77
    ]);

    const hex1 = "010203";
    const hex2 = "c444cce3a42d9192fb14ec84e0542bddf899b1849dbcd19d31dd67093f8b704d";

    it("should encode", () => {
        expect(hex.encode(bytes1)).to.equal(hex1);
        expect(hex.encode(bytes2)).to.equal(hex2);
    });

    it("should decode", () => {
        expect(hex.decode(hex1)).to.deep.equal(bytes1);
        expect(hex.decode(hex2)).to.deep.equal(bytes2);
    });
});
