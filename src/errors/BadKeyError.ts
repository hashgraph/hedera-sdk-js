export class BadKeyError extends Error {
    public constructor() {
        super();
        this.message = "Failed to parse correct key";
        this.name = "BadKeyError";
    }
}
