import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from "class-validator";
import * as hashgraph from "@hashgraph/sdk";

@ValidatorConstraint({ name: "wallet", async: false })
export class WalletValidator implements ValidatorConstraintInterface {
    validate(text?: string) {
        if (text == null) {
            return true;
        }

        try {
            hashgraph.AccountId.fromString(text);
            return true;
        } catch (_) {
            return false;
        }
    }

    defaultMessage() {
        return "failed to decode an account ID from input";
    }
}
