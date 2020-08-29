import * as crypto from "./aes.js";
import * as der from "../encoding/der.js";
import * as pbkdf2 from "./pbkdf2.js";
import * as hmac from "./hmac.js";

export class AlgorithmIdentifier {
    /**
     * @param {import("../encoding/der.js").AsnType} asn
     */
    constructor(asn) {
        if ("seq" in asn && asn.seq.length >= 1 && "ident" in asn.seq[0]) {
            /**
             * @type {string}
             */
            this.algIdent = asn.seq[0].ident;

            /**
             * @type {import("../encoding/der.js").AsnType | undefined}
             */
            this.parameters = asn.seq[1];
        } else {
            throw new Error(
                `error parsing AlgorithmIdentifier from ${JSON.stringify(asn)}`
            );
        }
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this);
    }
}

class PBES2Params {
    /**
     * @param {import("../encoding/der.js").AsnType} asn
     */
    constructor(asn) {
        if ("seq" in asn && asn.seq.length === 2) {
            /**
             * @type {AlgorithmIdentifier}
             */
            this.kdf = new AlgorithmIdentifier(asn.seq[0]);

            /**
             * @type {AlgorithmIdentifier}
             */
            this.encScheme = new AlgorithmIdentifier(asn.seq[1]);
        } else {
            throw new Error(
                `error parsing PBES2Params from ${JSON.stringify(asn)}`
            );
        }
    }
}

class PBKDF2Params {
    /**
     * @param {import("../encoding/der.js").AsnType} asn
     */
    constructor(asn) {
        if (
            "seq" in asn &&
            asn.seq.length >= 2 &&
            "bytes" in asn.seq[0] &&
            "int" in asn.seq[1]
        ) {
            /**
             * @type {Uint8Array}
             */
            this.salt = asn.seq[0].bytes;

            /**
             * @type {number}
             */
            this.iterCount = asn.seq[1]["int"];

            if (asn.seq.length > 2) {
                if ("seq" in asn.seq[2]) {
                    this.prf = new AlgorithmIdentifier(asn.seq[2]);
                    return;
                } else if ("int" in asn.seq[2]) {
                    /**
                     * @type {number | undefined}
                     */
                    this.keyLength = asn.seq[2]["int"];
                }

                if (asn.seq.length === 4) {
                    /**
                     * @type {AlgorithmIdentifier | undefined}
                     */
                    this.prf = new AlgorithmIdentifier(asn.seq[3]);
                }

                return;
            }
        }

        throw new Error(
            `error parsing PBKDF2Params from ${JSON.stringify(asn)}`
        );
    }
}

export class PrivateKeyInfo {
    /**
     * @param {import("../encoding/der.js").AsnType} asn
     */
    constructor(asn) {
        if ("seq" in asn && asn.seq.length === 3) {
            if ("int" in asn.seq[0] && asn.seq[0]["int"] === 0) {
                /**
                 * @type {number}
                 */
                this.version = 0;
            } else {
                throw new Error(
                    `expected version = 0, got ${JSON.stringify(asn.seq[0])}`
                );
            }

            /**
             * @type {AlgorithmIdentifier}
             */
            this.algId = new AlgorithmIdentifier(asn.seq[1]);

            if ("bytes" in asn.seq[2]) {
                /**
                 * @type {Uint8Array}
                 */
                this.privateKey = asn.seq[2].bytes;
            } else {
                throw new Error(
                    `expected octet string as 3rd element, got ${JSON.stringify(
                        asn.seq[3]
                    )}`
                );
            }

            return;
        }

        throw new Error(
            `error parsing PrivateKeyInfo from ${JSON.stringify(asn)}`
        );
    }

    /**
     * @param {Uint8Array} encoded
     * @returns {PrivateKeyInfo}
     */
    static parse(encoded) {
        return new PrivateKeyInfo(der.decode(encoded));
    }
}

export class EncryptedPrivateKeyInfo {
    /**
     * @param {import("../encoding/der.js").AsnType} asn
     */
    constructor(asn) {
        if ("seq" in asn && asn.seq.length === 2 && "bytes" in asn.seq[1]) {
            /**
             * @type {AlgorithmIdentifier}
             */
            this.algId = new AlgorithmIdentifier(asn.seq[0]);

            /**
             * @type {Uint8Array}
             */
            this.data = asn.seq[1].bytes;
            return;
        }

        throw new Error(
            `error parsing EncryptedPrivateKeyInfo from ${JSON.stringify(asn)}`
        );
    }

    /**
     * @param {Uint8Array} encoded
     * @returns {EncryptedPrivateKeyInfo}
     */
    static parse(encoded) {
        return new EncryptedPrivateKeyInfo(der.decode(encoded));
    }

    /**
     * @param {string} passphrase
     * @returns {Promise<PrivateKeyInfo>}
     */
    async decrypt(passphrase) {
        if (
            this.algId.algIdent !== "1.2.840.113549.1.5.13" ||
            !this.algId.parameters
        ) {
            // PBES2
            throw new Error(
                `unsupported key encryption algorithm: ${this.algId.toString()}`
            );
        }

        const pbes2Params = new PBES2Params(this.algId.parameters);

        if (
            pbes2Params.kdf.algIdent !== "1.2.840.113549.1.5.12" ||
            !pbes2Params.kdf.parameters
        ) {
            // PBKDF2
            throw new Error(
                `unsupported key derivation function: ${pbes2Params.kdf.toString()}`
            );
        }

        const pbkdf2Params = new PBKDF2Params(pbes2Params.kdf.parameters);

        if (!pbkdf2Params.prf) {
            throw new Error("unsupported PRF HMAC-SHA-1");
        } else if (pbkdf2Params.prf.algIdent !== "1.2.840.113549.2.9") {
            // HMAC-SHA-256
            throw new Error(`unsupported PRF ${pbkdf2Params.prf.toString()}`);
        }

        if (pbes2Params.encScheme.algIdent !== "2.16.840.1.101.3.4.1.2") {
            // AES-128-CBC
            throw new Error(
                `unsupported encryption scheme: ${pbes2Params.encScheme.toString()}`
            );
        }

        if (
            !pbes2Params.encScheme.parameters ||
            !("bytes" in pbes2Params.encScheme.parameters)
        ) {
            throw new Error(
                "expected IV as bytes for AES-128-CBC, " +
                    `got: ${JSON.stringify(pbes2Params.encScheme.parameters)}`
            );
        }

        const keyLen = pbkdf2Params.keyLength || 16;
        const iv = pbes2Params.encScheme.parameters.bytes;

        const key = await pbkdf2.deriveKey(
            hmac.HashAlgorithm.Sha256,
            passphrase,
            pbkdf2Params.salt,
            pbkdf2Params.iterCount,
            keyLen
        );

        const decrypted = await crypto.createDecipheriv(
            crypto.CipherAlgorithm.Aes128Cbc,
            key,
            iv,
            this.data
        );

        return PrivateKeyInfo.parse(decrypted);
    }
}
