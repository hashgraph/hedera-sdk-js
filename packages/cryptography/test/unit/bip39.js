import * as bip39 from "../../src/primitive/bip39.js";
import * as hex from "../../src/encoding/hex.js";

describe("bip39", function () {
    it("generates correct seed", async function () {
        const words = [
            "radar",
            "blur",
            "cabbage",
            "chef",
            "fix",
            "engine",
            "embark",
            "joy",
            "scheme",
            "fiction",
            "master",
            "release",
        ];
        const passphrase = "";
        const seed = await bip39.toSeed(words, passphrase);

        expect(hex.encode(seed)).to.be.equal(
            "ed37b3442b3d550d0fbb6f01f20aac041c245d4911e13452cac7b1676a070eda66771b71c0083b34cc57ca9c327c459a0ec3600dbaf7f238ff27626c8430a806"
        );
    });
});
