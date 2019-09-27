export class KeyMismatchException extends Error {
    private readonly _hmac: string;
    private readonly _expectedHmac: string;

    public constructor(hmac: Buffer, expectedHmac: Buffer) {
        super("key mismatch when loading from keystore");
        this._hmac = hmac.toString("hex");
        this._expectedHmac = expectedHmac.toString("hex");
    }
}
