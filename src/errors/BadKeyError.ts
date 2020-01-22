export class BadKeyError extends Error {
    public constructor() {
        super("Failed to parse correct key");
        this.name = "BadKeyError";
    }
}
