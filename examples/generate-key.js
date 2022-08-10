import { Mnemonic } from "@hashgraph/sdk";

async function main() {
    // generate a 24-word mnemonic
    const mnemonic = await Mnemonic.generate();

    console.log(`mnemonic = ${mnemonic.toString()}`);

    // convert to a new root key
    const rootKey = await mnemonic.toEd25519PrivateKey();

    // derive index #0
    // WARN: don't hand out your root key
    const key = await rootKey.derive(0);

    console.log(`private key = ${key.toString()}`);
    console.log(`public key = ${key.publicKey.toString()}`);

    // [...]

    // recover your key from the mnemonic
    // this takes space-separated or comma-separated words
    const recoveredMnemonic = await Mnemonic.fromString(mnemonic.toString());
    const recoveredRootKey = await recoveredMnemonic.toEd25519PrivateKey();

    // Returns the recover key
    await recoveredRootKey.derive(0);
}

void main();
