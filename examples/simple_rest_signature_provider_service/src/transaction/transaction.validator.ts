import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import * as hashgraph from "@hashgraph/sdk";

@ValidatorConstraint({ name: "transaction", async: false })
export class Transaction implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            hashgraph.Transaction.fromBytes(Buffer.from(text, "hex"));
            return true;
        } catch (_) {
            return false;
        }
    }

    defaultMessage() {
        return "failed to decode a transaction from input";
    }
}
