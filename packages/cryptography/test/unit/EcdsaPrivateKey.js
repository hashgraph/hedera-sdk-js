import EcdsaPrivateKey from "../../src/EcdsaPrivateKey.js";
import Mnemonic from "../../src/Mnemonic.js";
import PrivateKey from "../../src/PrivateKey.js";
import * as hex from "../../src/encoding/hex.js";
import * as utf8 from "../../src/encoding/utf8.js";

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

    it("can sign and verify body bytes", function () {
        const key = EcdsaPrivateKey.fromStringRaw(RAW_KEY);
        const message = hex.decode(
            "0a0e0a0408011001120608001000180412060800100018031880c2d72f220208783200721a0a180a0a0a0608001000180410130a0a0a060800100018051014"
        );
        const signature = key.sign(message);

        expect(signature.length).to.be.equal(64);
        expect(hex.encode(signature)).to.be.equal(
            "63201532040178a60e2738bdaaa00d628004b15d109162fa42e066fcb6720190bc7b8c440eaa028009404d56bebeea7f9c94d4dc07042c63cb0bcf0cab0ee737"
        );
        expect(key.publicKey.verify(message, signature)).to.be.true;
        expect(key.publicKey.toBytesRaw().length).to.be.equal(33);
    });

    it("generate EcdsaPrivateKey from Mnemonic, parse it to string, then return it fromString and check if it is the same", async function () {
        const mnemonic = await Mnemonic.fromString(
            "hamster produce dry base sunny bubble disease throw cricket garden beyond script"
        );
        const privateKey = await mnemonic.toEcdsaPrivateKey();

        const privateKeyString = privateKey.toStringRaw();
        const publicKeyString = privateKey.publicKey.toStringRaw();

        // Restore from string
        const restoredPrivateKey = PrivateKey.fromStringECDSA(privateKeyString);
        const restoredPrivateKeyString = privateKey.toStringRaw();
        const restoredPublicKeyString =
            restoredPrivateKey.publicKey.toStringRaw();

        expect(privateKeyString).to.be.equal(restoredPrivateKeyString);
        expect(publicKeyString).to.be.equal(restoredPublicKeyString);
    });
});
