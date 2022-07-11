import Status from "./Status.js";
import TransactionId from "./transaction/TransactionId.js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import * as hex from "./encoding/hex.js";
import AccountId from "./account/AccountId.js";

const ajv = new Ajv();

addFormats(ajv);

ajv.addFormat("StatusErrorName", {
    type: "string",
    validate: "StatusError",
});

ajv.addFormat(
    "Status",
    /** @type {ajv.ForamtValidator<string>} */ {
        validate: (/** @type {string} */ data) => {
            if (typeof data !== "string") {
                return false;
            }

            Status.fromString(data);
            return true;
        },
    }
);

ajv.addFormat("TransactionId", {
    validate: (/** @type {string} */ data) => {
        if (typeof data !== "string") {
            return false;
        }

        TransactionId.fromString(data);
        return true;
    },
});

ajv.addFormat("TransactionHash", {
    validate: (/** @type {string} */ data) => {
        if (typeof data !== "string") {
            return false;
        }

        const bytes = hex.decode(data);
        return bytes.length === 48;
    },
});

ajv.addFormat("AccountId", {
    validate: (/** @type {string} */ data) => {
        if (typeof data !== "string") {
            return false;
        }

        AccountId.fromString(data);
        return true;
    },
});
export default ajv;
