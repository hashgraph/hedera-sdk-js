const { Client, generateMnemonic, AccountCreateTransaction } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = new Client({
        nodes: { "0.testnet.hedera.com:50211": "0.0.3" },
        operator: {
            account: operatorAccount,
            privateKey: operatorPrivateKey,
        }
    });

    const { mnemonic, generateKey } = generateMnemonic();
    const privateKey = await generateKey();

    console.log("private =", privateKey.toString());
    console.log("mnemonic =", mnemonic);

    const tx = new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(0)
        .build(client);

    const id = await tx.execute(client);
    const receipt = await tx.waitForReceipt(client);

    console.log(`transaction ${JSON.stringify(id, null, 4)}`);
    console.log(`receipt ${JSON.stringify(receipt, null, 4)}`);
}

main();
