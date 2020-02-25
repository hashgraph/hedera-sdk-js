export class BadKeyError extends Error {
    public constructor(msg?: string) {
        super();
        this.message = msg ? msg : "Failed to parse correct key";
        this.name = "BadKeyError";
    }
}
