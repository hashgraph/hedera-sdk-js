export class BadPemFileError extends Error {
    public constructor() {
        super("Failed to parse .pem file");
        this.name = "BadPemFileError";
    }
}
