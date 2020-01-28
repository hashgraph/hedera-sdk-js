const { Client, CryptoTransferTransaction } = require("@hashgraph/sdk");

async function main() {
  const operatorPrivateKey = process.env.OPERATOR_KEY;
  const operatorAccount = process.env.OPERATOR_ID;

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

  // Confirmation 1 - Executing will run a "precheck"
  const transactionId = await new CryptoTransferTransaction()
    .addSender(operatorAccount, 0)
    .addRecipient("0.0.1", 0)
    .setMemo("testing :)")
    .execute(client);

  // Confirmation 2 - Ask for a receipt
  console.log("attempting to get receipt for transaction id = " + transactionId + '\n');
  const receipt = await transactionId.getReceipt(client);
  console.log('transaction ' + transactionId + ' receipt = ' + JSON.stringify(receipt) + '\n');

  // Confirmation 3 - Ask for a record 
  console.log("attempting to get record for transaction id = " + transactionId + '\n');
  const record = await transactionId.getRecord(client);
  console.log('transaction ' + transactionId + ' record = ' + JSON.stringify(record) + '\n');

  // Confrmation 4 - Stateproofs - coming 2020
  // Note: this may not be how the API works, it's just an example!
  // const proof = await transactionId.getStateProof(client);
}

main();
