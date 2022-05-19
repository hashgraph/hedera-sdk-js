import PublicKey from "../../src/PublicKey.js";
import * as hex from "../../src/encoding/hex.js";

const RAW_KEY =
    "033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d";
const RAW_KEY_BYTES = hex.decode(RAW_KEY);

const TRUFFLE_KEY =
    "03af80b90d25145da28c583359beb47b21796b2fe1a23c1511e443e7a64dfdb27d";
const TRUFFLE_KEY_BYTES = hex.decode(TRUFFLE_KEY);
const TRUFFLE_ADDRESS = "627306090abab3a6e1400e9345bc60c78a8bef57";

describe("PublicKey", function () {
    it("ECDSA serializes to same string as Java", function () {
        const key = PublicKey.fromBytesECDSA(RAW_KEY_BYTES);

        expect(key.toString()).to.be.equal(
            "302d300706052b8104000a032200033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d"
        );
    });

    it("ECDSA public key to ethereum address", function () {
        const key = PublicKey.fromBytesECDSA(TRUFFLE_KEY_BYTES);

        expect(key.toEthereumAddress()).to.be.equal(TRUFFLE_ADDRESS);
    });
});
