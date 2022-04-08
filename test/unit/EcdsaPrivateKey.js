import { expect } from "chai";

import { PrivateKey } from "../../src/index.js";
import * as hex from "../../src/encoding/hex.js";

const RAW_KEY =
    "8776c6b831a1b61ac10dac0304a2843de4716f54b1919bb91a2685d0fe3f3048";

describe("PrivateKey", function () {
    it("generate should return  object", function () {
        PrivateKey.generateECDSA();
    });

    it("generateAsync should return  object", async function () {
        await PrivateKey.generateECDSAAsync();
    });

    it("fromStringRaw and fromStringDer work", function () {
        PrivateKey.fromString(
            hex.encode(PrivateKey.fromStringECDSA(RAW_KEY).toBytesDer())
        );
    });

    it("public key fro a private key", function () {
        expect(
            PrivateKey.fromStringECDSA(RAW_KEY).publicKey.toStringRaw()
        ).to.be.equal(
            "02703a9370b0443be6ae7c507b0aec81a55e94e4a863b9655360bd65358caa6588"
        );
    });
});
