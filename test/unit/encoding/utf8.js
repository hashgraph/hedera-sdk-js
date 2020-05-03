import * as utf8 from "../../../src/encoding/utf8.js";

describe("utf8", () => {
    const text = "hello, world";

    const bytes = Uint8Array.from([
        104, 101, 108, 108,
        111,  44,  32, 119,
        111, 114, 108, 100
    ]);

    it("should encode", () => {
        expect(utf8.encode(text)).to.deep.equal(bytes);
    });

    it("should decode", () => {
        expect(utf8.decode(bytes)).to.equal(text);
    });
});
