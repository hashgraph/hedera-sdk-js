const { Client, Ed25519PrivateKey, AccountCreateTransaction } = require("@hashgraph/sdk");

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
            privateKey: operatorPrivateKey
        }
    });

    const privateKey = await Ed25519PrivateKey.generate();

    console.log("private =", privateKey.toString());

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
