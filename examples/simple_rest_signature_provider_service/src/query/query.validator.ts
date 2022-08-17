import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import * as hashgraph from "@hashgraph/sdk";

@ValidatorConstraint({ name: "query", async: false })
export class Query implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            hashgraph.Query.fromBytes(Buffer.from(text, "hex"));
            return true;
        } catch (_) {
            return false;
        }
    }

    defaultMessage() {
        return "failed to decode a query from input";
    }
}
