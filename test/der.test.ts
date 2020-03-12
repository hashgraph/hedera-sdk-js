import { decodeDer } from "../src/crypto/der";
import { decode as decodeHex } from "../src/encoding/hex";
import { expect } from "chai";
import "mocha";

describe("der.decode()", () => {
    it("decodes an Ed25519 private key as expected", () => {
        // taken from Keys.test.js
        const privateKey = "302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10";
        const rawPrivKey = "db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10";

        const privKeyBytes = decodeHex(privateKey);
        const rawPrivKeyBytes = decodeHex(rawPrivKey);

        const decoded = decodeDer(privKeyBytes);

        expect(decoded).to.deep.equal({
            seq: [
                { int: 0 },
                { seq: [{ ident: "1.3.101.112" }]},
                // in PKCS `PrivateKeyInfo` the key data is an opaque byte string
                // for Ed25519 the contents is another tagged DER `OCTET STRING`, kind of redundant
                // but for other key types this could be a complex structure
                { bytes: Uint8Array.of(4, 32, ...rawPrivKeyBytes) }
            ]
        });
    });

    it("decodes an EncryptedPrivateKeyInfo struct", () => {
        const base64Encoded = "MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAi8WY7Gy2tThQICCAAw" +
            "DAYIKoZIhvcNAgkFADAdBglghkgBZQMEAQIEEOq46NPss58chbjUn20NoK0EQG1x" +
            "R88hIXcWDOECttPTNlMXWJt7Wufm1YwBibrxmCq1QykIyTYhy1TZMyxyPxlYW6aV" +
            "9hlo4YEh3uEaCmfJzWM=";

        // otherwise the types produced by `.subarray()` won't match
        const data = Uint8Array.from(Buffer.from(base64Encoded, "base64"));

        const decoded = decodeDer(data);

        expect(decoded).to.deep.equal({
            seq: [
                {
                    seq: [
                        // algorithm: PBES2
                        { ident: "1.2.840.113549.1.5.13" },
                        // parameters
                        {
                            seq: [
                                {
                                    seq: [
                                        // PBKDF2
                                        { ident: "1.2.840.113549.1.5.12" },
                                        {
                                            seq: [
                                                // salt
                                                { bytes: decodeHex("bc598ec6cb6b5385") },
                                                // iterations
                                                { int: 2048 },
                                                {
                                                    seq: [
                                                        // HMAC-SHA-256
                                                        { ident: "1.2.840.113549.2.9" },
                                                        // no parameters
                                                        {}
                                                    ]
                                                }

                                            ]
                                        }
                                    ]
                                },
                                {
                                    seq: [
                                        // AES-128-CBC
                                        { ident: "2.16.840.1.101.3.4.1.2" },
                                        // IV
                                        { bytes: decodeHex("eab8e8d3ecb39f1c85b8d49f6d0da0ad") }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // encrypted key data
                {
                    bytes: decodeHex("6d7147cf212177160ce102b6d3d3365317589b7b5ae7e6d58c0189baf1982ab5" +
                        "432908c93621cb54d9332c723f19585ba695f61968e18121dee11a0a67c9cd63")
                }
            ]
        });
    });
});
