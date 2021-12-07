import EcdsaPrivateKey from "../src/EcdsaPrivateKey.js";
import * as hex from "../src/encoding/hex.js";

const RAW_KEY =
    "8776c6b831a1b61ac10dac0304a2843de4716f54b1919bb91a2685d0fe3f3048";

describe("EcdsaPrivateKey", function () {
    it("generate should return Ecdsa object", function () {
        EcdsaPrivateKey.generate();
    });

    it("generateAsync should return Ecdsa object", async function () {
        await EcdsaPrivateKey.generateAsync();
    });

    it("toBytesDer and toBytesRaw work", function () {
        EcdsaPrivateKey.generate();
    });

    it("fromStringRaw and fromStringDer work", function () {
        EcdsaPrivateKey.fromStringDer(
            hex.encode(EcdsaPrivateKey.fromStringRaw(RAW_KEY).toBytesDer())
        );
    });

    it("can sign and verify", function () {
        const key = EcdsaPrivateKey.fromStringRaw(RAW_KEY);
        const message = "hello world";
        const signature = key.sign(message);

        expect(key.publicKey.verify(message, signature)).to.be.true;
    });
});
