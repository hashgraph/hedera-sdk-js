import { keccak256 } from "../../src/cryptography/keccak.js";
import * as hex from "../src/encoding/hex.js";

describe("keccak256", function () {
    it("should hash to the expected value", function () {
        const hash = keccak256("method");

        expect(hash).to.eql(
            "0x9c87604675c4160b0aac6ee753604a7ebe1728c804a0ac841ff8bb02e543aa3a"
        );
    });

    it("should hash to the expected value for bytes larger than 127", function () {
        const hash = keccak256(
            hex.decode("0x00112233445566778899aabbccddeeff")
        );

        expect(hash).to.eql(
            "0x22bce46032802af0abfacf3768f7be04a34f5f01df60f44ffd52d3ca937350c0"
        );
    });

    it("should hash body bytes correctly", function () {
        const hash = keccak256(
            hex.decode(
                "0x0a0e0a0408011001120608001000180412060800100018031880c2d72f220208783200721a0a180a0a0a0608001000180410130a0a0a060800100018051014"
            )
        );

        expect(hash).to.eql(
            "0x90c1c5bb75d76d3cfed2c136525ffbcf381b4b3909cefd11b68b26ce6f9999b6"
        );
    });
});
