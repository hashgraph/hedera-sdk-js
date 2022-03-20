import PublicKey from "../../src/PublicKey.js";
import * as hex from "../../src/encoding/hex.js";

const RAW_KEY =
    "033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d";
const RAW_KEY_BYTES = hex.decode(RAW_KEY);

describe("PublicKey", function () {
    it("ECDSA serializes to same string as Java", function () {
        const key = PublicKey.fromBytesECDSA(RAW_KEY_BYTES);

        expect(key.toString()).to.be.equal(
            "302d300706052b8104000a032200033a514176466fa815ed481ffad09110a2d344f6c9b78c1d14afc351c3a51be33d"
        );
    });
});
