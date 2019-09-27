export class KeyMismatchException extends Error {
    private readonly hmac: string;
    private readonly expectedHmac: string;

    public constructor(hmac: Buffer, expectedHmac: Buffer) {
        super('key mismatch when loading from keystore');
        this.hmac = hmac.toString('hex');
        this.expectedHmac = expectedHmac.toString('hex');
    }
}