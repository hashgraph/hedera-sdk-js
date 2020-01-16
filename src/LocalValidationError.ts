export class LocalValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        super(`${className} failed validation:\n${errors.join("\n")}`);

        this.name = "ValidationError";
    }
}
