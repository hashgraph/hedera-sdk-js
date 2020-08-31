import * as base64 from "../../../src/encoding/base64.js";
import * as utf8 from "../../../src/encoding/utf8.js";

// from RFC 4648
const vectors = [
    ["", ""],
    ["f", "Zg=="],
    ["fo", "Zm8="],
    ["foo", "Zm9v"],
    ["foob", "Zm9vYg=="],
    ["fooba", "Zm9vYmE="],
    ["foobar", "Zm9vYmFy"],
];

describe("encoding/base64", function () {
    it("should encode", function () {
        for (const [decoded, encoded] of vectors) {
            expect(base64.encode(utf8.encode(decoded))).to.equal(encoded);
        }
    });

    it("should decode", function () {
        for (const [decoded, encoded] of vectors) {
            expect(utf8.decode(base64.decode(encoded))).to.equal(decoded);
        }
    });
});
