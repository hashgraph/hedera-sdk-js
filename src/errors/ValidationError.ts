// @deprecate This error is no longer in use in the sdk. Use `LocalValidationError` instead.
export class ValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        console.warn("`ValidationError` has been renamed to `LocalValidationError`");

        super();

        this.message = `${className} failed validation:\n${errors.join("\n")}`;
        this.name = "ValidationError";
    }
}
