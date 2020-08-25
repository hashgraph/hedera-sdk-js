export class BadPemFileError extends Error {
    constructor() {
        super();
        this.message = "Failed to parse .pem file";
        this.name = "BadPemFileError";
    }
}
