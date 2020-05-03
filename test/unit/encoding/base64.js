import * as base64 from "../../../src/encoding/base64";

describe("encoding/base64", () => {
    const text = "dGhpcyBpcyBhIHdvbmRlcmZ1bCBkYXkgaW4gdGhpcyB3b25kZXJmdWwgd29ybGQgb2YgZmxhbWU=";

    const bytes = Uint8Array.from([
        116, 104, 105, 115,  32, 105, 115,  32,  97,  32,
        119, 111, 110, 100, 101, 114, 102, 117, 108,  32,
        100,  97, 121,  32, 105, 110,  32, 116, 104, 105,
        115,  32, 119, 111, 110, 100, 101, 114, 102, 117,
        108,  32, 119, 111, 114, 108, 100,  32, 111, 102,
        32, 102, 108,  97, 109, 101
    ]);

    it("should encode", () => {
        expect(base64.encode(bytes)).to.equal(text);
    });

    it("should decode", () => {
        expect(base64.decode(text)).to.deep.equal(bytes);
    });
});
