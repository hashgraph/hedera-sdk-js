import { Mnemonic } from "@hashgraph/sdk";

async function main() {
    // generate a 24-word mnemonic
    const mnemonic = await Mnemonic.generate();
    console.log(`24 words mnemonic = ${mnemonic.toString()}`);

    const key = await mnemonic.toStandardEd25519PrivateKey("", 0);
    console.log(`private key = ${key.toString()}`);
    console.log(`public key = ${key.publicKey.toString()}`);

    // [...]

    // recover your key from the mnemonic
    // this takes space-separated or comma-separated words
    const recoveredMnemonic = await Mnemonic.fromString(mnemonic.toString());
    const recoveredRootKey =
        await recoveredMnemonic.toStandardEd25519PrivateKey("", 0);

    recoveredRootKey.toString() === key.toString()
        ? console.log(`successful key recovery!`)
        : console.log(`key recovery failed!`);

    const mnemonic12 = await Mnemonic.generate12();
    console.log(`12 words mnemonic = ${mnemonic12.toString()}`);

    const key12 = await mnemonic12.toStandardEd25519PrivateKey("", 0);
    console.log(`private key = ${key12.toString()}`);
    console.log(`public key = ${key12.publicKey.toString()}`);
}

void main();
