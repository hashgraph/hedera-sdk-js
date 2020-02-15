const { Client, Ed25519PrivateKey, Hbar, CryptoTransferTransaction } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const privateKey = await Ed25519PrivateKey.fromString(operatorPrivateKey);

    const tx = await new CryptoTransferTransaction()
          .addSender("147722", 10)
          .addRecipient("1001", 10);

    const cost = await tx.getCost(client);

    console.log(`Cost of account create transaction: ${cost}`);
    // const tx = new TransactionId(client._getOperatorAccountId()!);
    // this._inner.setTransactionid(tx._toProto());

    tx.setMaxTransactionFee(Hbar.fromTinybar(cost._tinybar.plus(191)));

    const transactionId = await tx.execute(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    console.log("receipt =", transactionReceipt);
}

main();
