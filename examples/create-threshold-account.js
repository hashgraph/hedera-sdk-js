const {
  Client,
  Ed25519PrivateKey,
  AccountCreateTransaction,
  ThresholdKey
} = require("@hashgraph/sdk");

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

  // Generate our key lists
  const privateKeyList = [];
  const publicKeyList = [];
  for (var i = 0; i < 4; i++) {
    var privateKey = await Ed25519PrivateKey.generate();
    var publicKey = privateKey.publicKey;
    privateKeyList.push(privateKey);
    publicKeyList.push(publicKey);
    console.log(i + ": pub key:" + publicKey);
    console.log(i + ": pub key:" + privateKey);
  }

  // Create our threshold key
  const thresholdKey = new ThresholdKey(3); // Define min # of sigs
  for (var i = 0; i < publicKeyList.length; i++) {
    thresholdKey.add(publicKeyList[i]);
  }

  // Create a new account with this threshold key
  const accountCreateTransaction = await new AccountCreateTransaction()
    .setKey(thresholdKey)
    .setInitialBalance(0)
    .execute(client);

  console.log(await accountCreateTransaction.getReceipt(client)._accountId);
}

main();
