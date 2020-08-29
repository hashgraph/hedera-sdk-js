import * as util from "util";
import { PrivateKey, PublicKey } from "./exprts.js";
export * from "./exports.js";


if (isAccessible("Buffer")) {
    // Override console.log output for some classes (to be toString)
    for (const cls of [
        PrivateKey,
        PublicKey,
    ]) {
        Object.defineProperty(cls.prototype, util.inspect.custom, {
            enumerable: false,
            writable: false,
            /**
             * @returns {string}
             */
            value() {
                return this.toString();
            }
        });
    }
}

