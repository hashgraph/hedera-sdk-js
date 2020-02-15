export class LocalValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        super();

        this.message = `${className} failed validation:\n${errors.join("\n")}`;
        this.name = "ValidationError";
    }
}
