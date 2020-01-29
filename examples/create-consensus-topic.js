const { Client, ConsensusTopicCreateTransaction } = require("@hashgraph/sdk");

async function main() {
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = process.env.OPERATOR_KEY;

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

  const tx = await new ConsensusTopicCreateTransaction().execute(client);
  console.log("tx:", tx);

  const receipt = await tx.getReceipt(client);
  const newTopicId = receipt.getTopicId();
  console.log("new HCS topic ID:", newTopicId);
}

main();
