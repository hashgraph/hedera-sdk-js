export interface RawKeyPair {
    /** 32-byte raw Ed25519 private key */
    privateKey: Uint8Array;
    /** 32-byte raw Ed25519 public key */
    publicKey: Uint8Array;
}
