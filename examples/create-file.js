const { Client, FileCreateTransaction, Ed25519PublicKey, Hbar } = require("@hashgraph/sdk");

async function main() {
  
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const operatorPublicKey = Ed25519PublicKey.fromString(process.env.OPERATOR_PUB_KEY);

  if (operatorPrivateKey == null || operatorAccount == null) {
    throw new Error(
      "environment variables OPERATOR_KEY and OPERATOR_ID must be present"
    );
  }

  const client = new Client({
    network: { "0.testnet.hedera.com:50211": "0.0.3" },
    operator: {
      account: operatorAccount,
      privateKey: operatorPrivateKey
    }
  });

  const transactionId = await new FileCreateTransaction()
    .setContents("Hello, Hedera's file service!")
    .addKey(operatorPublicKey) // Defines the "admin" of this file
    .setMaxTransactionFee(Hbar.of(1000))
    .execute(client);

  const receipt = await transactionId.getReceipt(client);  
  console.log("new file id = ", receipt._fileId);
}

main();
