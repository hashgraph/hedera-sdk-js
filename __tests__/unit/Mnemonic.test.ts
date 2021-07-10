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

    it("should match MyHbarWallet v1", async() => {
        const mnemonic = await Mnemonic.fromString("jolly kidnap Tom lawn drunk chick optic lust mutter mole bride galley dense member sage neural widow decide curb aboard margin manure");
        const rootPrivateKey = await mnemonic.toLegacyPrivateKey();
        const privateKeyMhw = await rootPrivateKey.legacyDerive(1099511627775);

        expect(privateKeyMhw.publicKey.toString()).toStrictEqual("302a300506032b657003210045f3a673984a0b4ee404a1f4404ed058475ecd177729daa042e437702f7791e9");
    });

    it("should match hedera-keygen-java for a 22-word legacy phrase", async() => {
        const mnemonic = await Mnemonic.fromString("jolly kidnap tom lawn drunk chick optic lust mutter mole bride galley dense member sage neural widow decide curb aboard margin manure");

        const rootPrivateKey = await mnemonic.toLegacyPrivateKey();

        const privateKey0 = await rootPrivateKey.legacyDerive(0);
        const privateKeyNeg1 = await rootPrivateKey.legacyDerive(-1);

        expect(privateKey0.toString()).toStrictEqual("302e020100300506032b657004220420fae0002d2716ea3a60c9cd05ee3c4bb88723b196341b68a02d20975f9d049dc6");
        expect(privateKeyNeg1.toString()).toStrictEqual("302e020100300506032b657004220420882a565ad8cb45643892b5366c1ee1c1ef4a730c5ce821a219ff49b6bf173ddf");
    });

    it("should match hedera-keygen-java for a 24-word legacy phrase", async() => {
        const mnemonic = await Mnemonic.fromString("obvious favorite remain caution remove laptop base vacant increase video erase pass sniff sausage knock grid argue salt romance way alone fever slush dune");

        const rootPrivateKey = await mnemonic.toLegacyPrivateKey();

        const privateKey0 = await rootPrivateKey.legacyDerive(0);
        const privateKeyNeg1 = await rootPrivateKey.legacyDerive(-1);

        expect(privateKey0.toString()).toStrictEqual("302e020100300506032b6570042204202b7345f302a10c2a6d55bf8b7af40f125ec41d780957826006d30776f0c441fb");
        expect(privateKeyNeg1.toString()).toStrictEqual("302e020100300506032b657004220420caffc03fdb9853e6a91a5b3c57a5c0031d164ce1c464dea88f3114786b5199e5");
    });
});
