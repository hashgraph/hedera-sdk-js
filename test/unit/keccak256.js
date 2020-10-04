import { keccak256 } from "../src/keccak";
import * as hex from "../src/encoding/hex";

describe("keccak256", function () {
    it("should hash to the expected value", function () {
        const hashBytes = keccak256("method");
        const hash = hex.encode(hashBytes);

        expect(hash).to.eql(
            "9c87604675c4160b0aac6ee753604a7ebe1728c804a0ac841ff8bb02e543aa3a"
        );
    });
});
