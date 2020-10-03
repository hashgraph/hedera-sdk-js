const { Mnemonic } = require("@hashgraph/sdk");
const { assert } = require("console");

async function main() {
    // generate a 24-word mnemonic
    const mnemonic = await Mnemonic.generate();

    console.log(`mnemonic = ${mnemonic}`);

    // convert to a new root key
    const rootKey = await mnemonic.toPrivateKey();

    // derive index #0
    // WARN: don't hand out your root key
    const key = await rootKey.derive(0);

    console.log(`private key = ${key}`);
    console.log(`public key = ${key.publicKey}`);

    // [...]

    // recover your key from the mnemonic
    // this takes space-separated or comma-separated words
    const recoveredMnemonic = await Mnemonic.fromString(mnemonic.toString());
    const recoveredRootKey = await recoveredMnemonic.toPrivateKey();
    const recoveredKey = await recoveredRootKey.derive(0);

    assert(recoveredKey.toString() === key.toString());
}

void main();
