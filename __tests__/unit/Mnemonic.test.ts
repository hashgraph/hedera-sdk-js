import { Mnemonic } from "../../src/crypto/Mnemonic";
import { MnemonicValidationStatus } from "../../src/crypto/MnemonicValidationStatus";

describe("Mnemonic", () => {
    // Keys.test.ts covers mnemonic -> Ed25519PrivateKey

    it(".generate() generates valid mnemonics", () => {
        const mnemonic = Mnemonic.generate();
        const result = mnemonic.validate();

        expect(result.status).toStrictEqual(MnemonicValidationStatus.Ok);
        expect(result.unknownIndices).toBeUndefined();
        expect(result.isOk()).toBeTruthy();
    });

    const strings = [
        "inmate flip alley wear offer often piece magnet surge toddler submit right radio absent pear floor belt raven price stove replace reduce plate home",
        "tiny denial casual grass skull spare awkward indoor ethics dash enough flavor good daughter early hard rug staff capable swallow raise flavor empty angle",
        "ramp april job flavor surround pyramid fish sea good know blame gate village viable include mixed term draft among monitor swear swing novel track"
    ];

    it.each(strings)("Mnemonic.fromString(%s).validate() returns success", (string) => {
        const mnemonic = Mnemonic.fromString(string);
        const result = mnemonic.validate();

        expect(result.status).toStrictEqual(MnemonicValidationStatus.Ok);
        expect(result.unknownIndices).toBeUndefined();
        expect(result.isOk()).toBeTruthy();
    });

    it(".validate() returns error on short word list", () => {
        const mnemonic = new Mnemonic([ "lorem", "ipsum", "dolor" ]);
        const result = mnemonic.validate();

        expect(result.status).toStrictEqual(MnemonicValidationStatus.BadLength);
        expect(result.unknownIndices).toBeUndefined();
        expect(result.isOk()).toBeFalsy();
    });

    it(".validate() returns error on invalid words", () => {
        const words = [
            "abandon",
            "ability",
            "able",
            "about",
            "above",
            "absent",
            "adsorb", // typo from "absorb"
            "abstract",
            "absurd",
            "abuse",
            "access",
            "accident",
            "acount", // typo from "account"
            "accuse",
            "achieve",
            "acid",
            "acoustic",
            "acquired", // typo from "acquire"
            "across",
            "act",
            "action",
            "actor",
            "actress",
            "actual"
        ];

        const mnemonic = new Mnemonic(words);
        const result = mnemonic.validate();

        expect(result.status).toStrictEqual(MnemonicValidationStatus.UnknownWords);
        expect(result.unknownIndices).toStrictEqual([ 6, 12, 17 ]);
        expect(result.isOk()).toBeFalsy();
    });

    it(".validate() returns bad checksum result", () => {
        // this mnemonic was just made up, the checksum should definitely not match
        const words = [
            "abandon",
            "ability",
            "able",
            "about",
            "above",
            "absent",
            "absorb",
            "abstract",
            "absurd",
            "abuse",
            "access",
            "accident",
            "account",
            "accuse",
            "achieve",
            "acid",
            "acoustic",
            "acquire",
            "across",
            "act",
            "action",
            "actor",
            "actress",
            "actual"
        ];

        const mnemonic = new Mnemonic(words);
        const result = mnemonic.validate();

        expect(result.status).toStrictEqual(MnemonicValidationStatus.ChecksumMismatch);
        expect(result.unknownIndices).toBeUndefined();
        expect(result.isOk()).toBeFalsy();
    });
});
