import * as crypto from "crypto";
import { AsnType, decodeDer } from "./der";
import { Pbkdf2 } from "./Pbkdf2";
import { HashAlgorithm } from "./Hmac";

export class AlgorithmIdentifier {
    public readonly algIdent: string;
    public readonly parameters?: AsnType;

    public constructor(asn: AsnType) {
        if ("seq" in asn && asn.seq.length >= 1 && "ident" in asn.seq[ 0 ]) {
            this.algIdent = asn.seq[ 0 ].ident;
            this.parameters = asn.seq[ 1 ];
        } else {
            throw new Error(`error parsing AlgorithmIdentifier from ${JSON.stringify(asn)}`);
        }
    }

    public toString(): string {
        return JSON.stringify(this);
    }
}

class PBES2Params {
    public readonly kdf: AlgorithmIdentifier;
    public readonly encScheme: AlgorithmIdentifier;

    public constructor(asn: AsnType) {
        if ("seq" in asn && asn.seq.length === 2) {
            this.kdf = new AlgorithmIdentifier(asn.seq[ 0 ]);
            this.encScheme = new AlgorithmIdentifier(asn.seq[ 1 ]);
        } else {
            throw new Error(`error parsing PBES2Params from ${JSON.stringify(asn)}`);
        }
    }
}

class PBKDF2Params {
    public readonly salt: Uint8Array;
    public readonly iterCount: number;
    public readonly keyLength?: number;
    public readonly prf?: AlgorithmIdentifier;

    public constructor(asn: AsnType) {
        if ("seq" in asn && asn.seq.length >= 2 && "bytes" in asn.seq[ 0 ] && "int" in asn.seq[ 1 ]) {
            this.salt = asn.seq[ 0 ].bytes;
            this.iterCount = asn.seq[ 1 ][ "int" ];

            if (asn.seq.length > 2) {
                if ("seq" in asn.seq[ 2 ]) {
                    this.prf = new AlgorithmIdentifier(asn.seq[ 2 ]);
                    return;
                } else if ("int" in asn.seq[ 2 ]) {
                    this.keyLength = asn.seq[ 2 ][ "int" ];
                }

                if (asn.seq.length === 4) {
                    this.prf = new AlgorithmIdentifier(asn.seq[ 3 ]);
                }

                return;
            }
        }

        throw new Error(`error parsing PBKDF2Params from ${JSON.stringify(asn)}`);
    }
}

export class PrivateKeyInfo {
    public readonly version: 0;
    public readonly algId: AlgorithmIdentifier;
    public readonly privateKey: Uint8Array;

    public constructor(asn: AsnType) {
        if ("seq" in asn && asn.seq.length === 3) {
            if ("int" in asn.seq[ 0 ] && asn.seq[ 0 ][ "int" ] === 0) {
                this.version = 0;
            } else {
                throw new Error(`expected version = 0, got ${JSON.stringify(asn.seq[ 0 ])}`);
            }

            this.algId = new AlgorithmIdentifier(asn.seq[ 1 ]);

            if ("bytes" in asn.seq[ 2 ]) {
                this.privateKey = asn.seq[ 2 ].bytes;
            } else {
                throw new Error(`expected octet string as 3rd element, got ${JSON.stringify(asn.seq[ 3 ])}`);
            }

            return;
        }

        throw new Error(`error parsing PrivateKeyInfo from ${JSON.stringify(asn)}`);
    }

    public static parse(encoded: Uint8Array): PrivateKeyInfo {
        return new PrivateKeyInfo(decodeDer(encoded));
    }
}

export class EncryptedPrivateKeyInfo {
    public readonly algId: AlgorithmIdentifier;
    public readonly data: Uint8Array;

    public constructor(asn: AsnType) {
        if ("seq" in asn && asn.seq.length === 2 && "bytes" in asn.seq[ 1 ]) {
            this.algId = new AlgorithmIdentifier(asn.seq[ 0 ]);
            this.data = asn.seq[ 1 ].bytes;
            return;
        }

        throw new Error(`error parsing EncryptedPrivateKeyInfo from ${JSON.stringify(asn)}`);
    }

    public static parse(encoded: Uint8Array): EncryptedPrivateKeyInfo {
        return new EncryptedPrivateKeyInfo(decodeDer(encoded));
    }

    public async decrypt(passphrase: string): Promise<PrivateKeyInfo> {
        if (this.algId.algIdent !== "1.2.840.113549.1.5.13" || !this.algId.parameters) { // PBES2
            throw new Error(`unsupported key encryption algorithm: ${this.algId}`);
        }

        const pbes2Params = new PBES2Params(this.algId.parameters);

        if (pbes2Params.kdf.algIdent !== "1.2.840.113549.1.5.12" || !pbes2Params.kdf.parameters) { // PBKDF2
            throw new Error(`unsupported key derivation function: ${pbes2Params.kdf}`);
        }

        const pbkdf2Params = new PBKDF2Params(pbes2Params.kdf.parameters);

        if (!pbkdf2Params.prf) {
            throw new Error("unsupported PRF HMAC-SHA-1");
        } else if (pbkdf2Params.prf.algIdent !== "1.2.840.113549.2.9") { // HMAC-SHA-256
            throw new Error(`unsupported PRF ${pbkdf2Params.prf}`);
        }

        if (pbes2Params.encScheme.algIdent !== "2.16.840.1.101.3.4.1.2") { // AES-128-CBC
            throw new Error(`unsupported encryption scheme: ${pbes2Params.encScheme}`);
        }

        if (!pbes2Params.encScheme.parameters || !("bytes" in pbes2Params.encScheme.parameters)) {
            throw new Error("expected IV as bytes for AES-128-CBC, " +
                `got: ${JSON.stringify(pbes2Params.encScheme.parameters)}`);
        }

        const keyLen = pbkdf2Params.keyLength || 16;
        const iv = pbes2Params.encScheme.parameters.bytes;

        const key = await Pbkdf2.deriveKey(
            HashAlgorithm.Sha256,
            passphrase,
            pbkdf2Params.salt,
            pbkdf2Params.iterCount,
            keyLen
        );

        const cipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        const decrypted = Buffer.concat([ cipher.update(this.data), cipher[ "final" ]() ]);

        return PrivateKeyInfo.parse(decrypted);
    }
}
