import { EncryptedPrivateKeyInfo } from "../../src/pkcs.js";
import { decodeDer } from "../../src/encoding/der.js";
import PrivateKey from "../../src/PrivateKey.js";
import * as base64 from "../../src/encoding/base64.js";
import * as hex from "../../src/encoding/hex.js";

describe("EncryptedPrivateKeyInfo", () => {
    const base64Encoded = "MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAi8WY7Gy2tThQICCAAw"
        + "DAYIKoZIhvcNAgkFADAdBglghkgBZQMEAQIEEOq46NPss58chbjUn20NoK0EQG1x"
        + "R88hIXcWDOECttPTNlMXWJt7Wufm1YwBibrxmCq1QykIyTYhy1TZMyxyPxlYW6aV"
        + "9hlo4YEh3uEaCmfJzWM=";

    const passphrase = "this is a passphrase";

    const keyStr = "302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10";

    // otherwise the types produced by `.subarray()` won't match
    const data = base64.decode(base64Encoded);

    it('decodes', () => {
        const privateKeyInfo = EncryptedPrivateKeyInfo.parse(data);
        expect(privateKeyInfo).to.deep.equal(new EncryptedPrivateKeyInfo({
            seq: [
                {
                    seq: [
                        // algorithm: PBES2
                        { ident: '1.2.840.113549.1.5.13' },
                        // parameters
                        {
                            seq: [
                                {
                                    seq: [
                                        // PBKDF2
                                        { ident: '1.2.840.113549.1.5.12' },
                                        {
                                            seq: [
                                                // salt
                                                { bytes: hex.decode('bc598ec6cb6b5385') },
                                                // iterations
                                                { int: 2048 },
                                                {
                                                    seq: [
                                                        // HMAC-SHA-256
                                                        { ident: '1.2.840.113549.2.9' },
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
                                        { ident: '2.16.840.1.101.3.4.1.2' },
                                        // IV
                                        { bytes: hex.decode('eab8e8d3ecb39f1c85b8d49f6d0da0ad') }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // encrypted key data
                {
                    bytes: hex.decode('6d7147cf212177160ce102b6d3d3365317589b7b5ae7e6d58c0189baf1982ab5'
                        + '432908c93621cb54d9332c723f19585ba695f61968e18121dee11a0a67c9cd63')
                }
            ]
        }));
    });

    it('decrypts the proper private key', async () => {
        const encrypted = EncryptedPrivateKeyInfo.parse(data);
        const decrypted = await encrypted.decrypt(passphrase);

        expect(decrypted.algId.algIdent).to.deep.equal("1.3.101.112");

        // for  the private key data is a DER encoded octet string
        const keyData = decodeDer(decrypted.privateKey);
        expect("bytes" in keyData).to.be.true;

        // @ts-ignore Typescript doesn't see that we just checked `keyData`
        expect(PrivateKey.fromBytes(keyData.bytes).toString())
            .to.deep.equal(keyStr);
    })
});

