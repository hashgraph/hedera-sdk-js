import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "hex", async: false })
export class HexValidator implements ValidatorConstraintInterface {
    validate(text: string[]) {
        try {
            text.map((text) => Buffer.from(text, "hex"));
            return true;
        } catch (_) {
            return false;
        }
    }

    defaultMessage() {
        return "failed to decoded hex bytes";
    }
}
