/**
 * Possible statuses for {@link Mnemonic#validate()}.
 *
 * @readonly
 * @enum {string}
 */
const BadMnemonicReason = Object.freeze({
    /**
     * The mnemonic did not have a supported number of words (12 or 24 for regular and 22 for legacy).
     */
    BadLength: "BadLength",

    /**
     * The mnemonic contained words which were not found in the word list.
     */
    UnknownWords: "UnknownWords",

    /**
     * The checksum encoded in the mnemonic did not match the checksum we just calculated for
     * that mnemonic.
     *
     * 24-word mnemonics have an 8-bit checksum that is appended to the 32 bytes of source entropy
     * after being calculated from it, before being encoded into words.
     *
     * This could happen if two or more of the words were entered out of the original order or
     * replaced with another from the standard word list (as this is only returned if all the words
     * exist in the word list).
     */
    ChecksumMismatch: "ChecksumMismatch",
});

export default BadMnemonicReason;
