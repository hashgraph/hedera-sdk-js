import * as hex from "../encoding/hex";

export class KeyMismatchError extends Error {
    private readonly _hmac: string;
    private readonly _expectedHmac: string;

    public constructor(hmac: Uint8Array, expectedHmac: Uint8Array) {
        super("key mismatch when loading from keystore");

        this.name = "KeyMismatchError";
        this._hmac = hex.encode(hmac);
        this._expectedHmac = hex.encode(expectedHmac);
    }
}
