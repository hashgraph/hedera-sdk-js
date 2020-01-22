// @deprecate This error is no longer in use in the sdk. Use `LocalValidationError` instead.
export class ValidationError extends Error {
    public constructor(className: string, errors: string[]) {
        console.warn("`ValidationError` is deprecated. Use `LocalValidationError` instead");
        super(`${className} failed validation:\n${errors.join("\n")}`);

        this.name = "ValidationError";
    }
}
