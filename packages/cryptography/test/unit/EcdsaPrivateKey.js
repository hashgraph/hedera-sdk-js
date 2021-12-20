import EcdsaPrivateKey from "../src/EcdsaPrivateKey.js";
import * as hex from "../src/encoding/hex.js";
import * as utf8 from "../src/encoding/utf8.js";

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
        const message = utf8.encode("hello world");
        const signature = key.sign(message);

        expect(signature.length).to.be.equal(64);
        expect(hex.encode(signature)).to.be.equal(
            "f3a13a555f1f8cd6532716b8f388bd4e9d8ed0b252743e923114c0c6cbfe414cf791c8e859afd3c12009ecf2cb20dacf01636d80823bcdbd9ec1ce59afe008f0"
        );
        expect(key.publicKey.verify(message, signature)).to.be.true;
        expect(key.publicKey.toBytesRaw().length).to.be.equal(33);
    });
});
