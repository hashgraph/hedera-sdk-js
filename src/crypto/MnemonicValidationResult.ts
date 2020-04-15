import { MnemonicValidationStatus } from "./MnemonicValidationStatus";

/**
 * The output of `toString()` is not part of the stable API; it only appears in the typedef
 * so that Typescript allows us to define it.
 */
export class MnemonicValidationResult {
    public readonly status: MnemonicValidationStatus;

    /**
     * If not null, these are the indices in the mnemonic that were not found in the
     * BIP-39 standard English word list.
     *
     * If {@link status} is {@link MnemonicValidationStatus.UnknownWords} then this will be non-null.
     */
    public readonly unknownIndices?: number[];

    public constructor(status: MnemonicValidationStatus, unknownIndices?: number[]) {
        this.status = status;
        this.unknownIndices = unknownIndices;
    }

    public isOk(): boolean {
        return this.status === MnemonicValidationStatus.Ok;
    }

    public toString(): string {
        switch (this.status) {
            case MnemonicValidationStatus.Ok:
                return "mnemonic passed validation";
            case MnemonicValidationStatus.BadLength:
                return "mnemonic did not contain exactly 24 words";
            case MnemonicValidationStatus.UnknownWords:
                return "mnemonic contained words that are not in the standard BIP-39 English word list";
            case MnemonicValidationStatus.ChecksumMismatch:
                return "checksum byte in mnemonic did not match the rest of the mnemonic";
            case MnemonicValidationStatus.UnknownLegacyWords:
                return "legacy mnemonic contained words that are not in the legacy word list";
            default:
                throw new Error(`(BUG) missing branch for status: ${this.status}`);
        }
    }
}
