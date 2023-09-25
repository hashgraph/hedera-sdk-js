/** @typedef {import("./Mnemonic.js").default} Mnemonic */
import BadMnemonicReason from "./BadMnemonicReason.js";

export default class BadMnemonicError extends Error {
    /**
     * @param {Mnemonic} mnemonic
     * @param {string} reason
     * @param {number[]} unknownWordIndices
     * @hideconstructor
     */
    constructor(mnemonic, reason, unknownWordIndices) {
        let reasonMessage;

        switch (reason) {
            case BadMnemonicReason.BadLength:
                reasonMessage = "mnemonic is of an unexpected number of words";
                break;

            case BadMnemonicReason.ChecksumMismatch:
                reasonMessage =
                    "checksum byte in mnemonic did not match the rest of the mnemonic";
                break;

            case BadMnemonicReason.UnknownWords:
                reasonMessage =
                    "mnemonic contained words that are not in the standard word list";
                break;

            default:
                throw new Error(
                    `unexpected value ${reason.toString()} for 'reason'`,
                );
        }

        super(`invalid mnemonic: ${reasonMessage}`);

        if (typeof Error.captureStackTrace !== "undefined") {
            Error.captureStackTrace(this, BadMnemonicError);
        }

        this.name = "BadMnemonicError";

        /** The reason for which the mnemonic failed validation. */
        this.reason = reason;

        /** The mnemonic that failed validation. */
        this.mnemonic = mnemonic;

        /**
         * The indices in the mnemonic that were not found in the BIP-39
         * standard English word list.
         */
        this.unknownWordIndices = unknownWordIndices;
    }
}
