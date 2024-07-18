import {
  Wallet,
  LocalProvider,
  PrivateKey,
  PublicKey,
  Hbar,
  AccountId,
  AccountBalanceQuery,
  AccountInfoQuery,
  TransferTransaction,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

async function main() {
  if (
    process.env.OPERATOR_ID == null ||
    process.env.OPERATOR_KEY == null ||
    process.env.HEDERA_NETWORK == null
  ) {
    throw new Error(
      "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
    );
  }

  let provider = new LocalProvider();

  console.log('"Creating" a new account');

  const privateKey = PrivateKey.generateED25519();
  const publicKey = privateKey.publicKey;

  const aliasAccountId = publicKey.toAccountId(0, 0);

  console.log(`New account ID: ${aliasAccountId.toString()}`);
  console.log(`Just the aliasKey: ${aliasAccountId.aliasKey.toString()}`);

  AccountId.fromString(
    "0.0.302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777",
  );

  PublicKey.fromString(
    "302a300506032b6570032100114e6abc371b82dab5c15ea149f02d34a012087b163516dd70f44acafabf7777",
  ).toAccountId(0, 0);

  console.log("Transferring some Hbar to the new account");
  let count = 1;
  while (true) {
    try {
      const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        provider,
      );
      console.log(`Attempt number: ${count}`);
      let transaction = await new TransferTransaction()
        .addHbarTransfer(wallet.getAccountId(), new Hbar(1).negated())
        .addHbarTransfer(aliasAccountId, new Hbar(1))
        .freezeWithSigner(wallet);
      transaction = await transaction.signWithSigner(wallet);

      const response = await transaction.executeWithSigner(wallet);


      // ------- //


      await response.getReceiptWithSigner(wallet);

      const balance = await new AccountBalanceQuery()
        .setNodeAccountIds([response.nodeId])
        .setAccountId(aliasAccountId)
        .executeWithSigner(wallet);

      console.log(`Balances of the new account: ${balance.toString()}`);

      console.log("\x1b[32mExample complete!\x1b[0m");
    } catch (error) {
      console.error(error);
      console.log("\x1b[31mExample failed!\x1b[0m");
      break;
    } finally {
      // provider.close()
      // provider = new LocalProvider();
    }
    count++;
  }
}

void main();
