import * as bip39 from "bip39";
import { Ed25519PrivateKey } from "./Ed25519PrivateKey";

/** result of `generateMnemonic()` */
export class Mnemonic {
    public readonly words: string[];
    /** Lazily generate the key, providing an optional passphrase to protect it with */

    public constructor(words: string[]) {
        this.words = words;
    }

    public toPrivateKey(passphrase: string): Promise<Ed25519PrivateKey> {
        return Ed25519PrivateKey.fromMnemonic(this, passphrase);
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
    public static generate(): Mnemonic {
        // 256-bit entropy gives us 24 words
        return new Mnemonic(bip39.generateMnemonic(256).split(" "));
    }

    public static fromString(mnemonic: string): Mnemonic {
        return new Mnemonic(mnemonic.split(" "));
    }

    public toString(): string {
        return this.words.join(" ");
    }
}
