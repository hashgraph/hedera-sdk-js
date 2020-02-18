export class BadPemFileError extends Error {
    public constructor() {
        super();
        this.message = "Failed to parse .pem file";
        this.name = "BadPemFileError";
    }
}
