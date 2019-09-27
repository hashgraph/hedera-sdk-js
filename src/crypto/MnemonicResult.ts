import * as bip39 from "bip39";
import {Ed25519PrivateKey} from "./Ed25519PrivateKey";

/** result of `generateMnemonic()` */
export type MnemonicResult = {
    mnemonic: string;
    /** Lazily generate the key, providing an optional passphrase to protect it with */
    generateKey: (passphrase?: string) => Promise<Ed25519PrivateKey>;
}

/**
 * Generate a random 24-word mnemonic.
 *
 * If you are happy with the mnemonic produced you can call `.generateKey()` on the returned object.
 *
 * This mnemonics that are compatible with the Android and iOS mobile wallets.
 *
 * **NOTE:** Mnemonics must be saved separately as they cannot be later recovered from a given key.
 */
export function generateMnemonic(): MnemonicResult {
    // 256-bit entropy gives us 24 words
    const mnemonic = bip39.generateMnemonic(256);
    return { mnemonic, generateKey: (passphrase) => Ed25519PrivateKey.fromMnemonic(mnemonic, passphrase) };
}
