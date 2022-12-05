//import Mnemonic from "../../src/Mnemonic.js";
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

    it("mnemonic passphrase NFKD normalization compliant test", async function () {
        const words = [
            "inmate",
            "flip",
            "alley",
            "wear",
            "offer",
            "often",
            "piece",
            "magnet",
            "surge",
            "toddler",
            "submit",
            "right",
            "radio",
            "absent",
            "pear",
            "floor",
            "belt",
            "raven",
            "price",
            "stove",
            "replace",
            "reduce",
            "plate",
            "home",
        ];

        const unicodePassphrase =
            "\u0070\u0061\u0073\u0073\u0070\u0068\u0072\u0061\u0073\u0065";
        const expectedPrivateKey =
            "1ed95521b3406aa1e34db78be696db32f09d9f8ec3115fc12314082a44a3e8d6d4551a1905758b45bc315430f7d9c095da93645f1b0004c393370e0a878dfd4c";

        const seed = await bip39.toSeed(words, unicodePassphrase);

        expect(hex.encode(seed)).to.be.equal(expectedPrivateKey);
    });
});
