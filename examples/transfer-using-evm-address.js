import {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    TokenNftInfoQuery,
    NftId,
    AccountInfoQuery,
    TransactionReceipt,
    AccountCreateTransaction,
    Hbar,
    Timestamp,
    TransactionId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();


/* 
Transfer HBAR or tokens to a Hedera account using their public-address.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1
- Create an ECSDA private key 
- Extract the ECDSA public key
- Extract the Ethereum public address
  - Add function to calculate the Ethereum Address to example in SDK
  - Ethereum account address / public-address - This is the rightmost 20 bytes of the 32 byte Keccak-256 hash of the ECDSA public key of the account. This calculation is in the manner described by the Ethereum Yellow Paper.
- Transfer tokens using the `TransferTransaction` to the Etherum Account Address
- The From field should be a complete account that has a public address
- The To field should be to a public address (to create a new account)
- Get the child receipt or child record to return the Hedera Account ID for the new account that was created
- Get the `AccountInfo` on the new account and show it is a hollow account by not having a public key
- This is a hollow account in this state
- Use the hollow account as a transaction fee payer in a HAPI transaction
- Sign the transaction with ECDSA private key
- Get the `AccountInfo` of the account and show the account is now a complete account by returning the public key on the account
*/


async function main() {
  if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
      throw new Error(
          "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
      );
  }
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

  //const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  const client = Client.forLocalNode().setOperator(operatorId, operatorKey);

  /**
   * Step 1
   *
   * Create an ECSDA private key
   */
  const privateKey = PrivateKey.generateECDSA();
  
  /**
   * Step 2
   *
   * Extract the ECDSA public key
   */
  const publicKey = privateKey.publicKey;
  
  /**
   *
   * Step 3
   *
   * Extract the Ethereum public address
   */
  const evmAddress = publicKey.toEvmAddress();
  console.log(`Corresponding evm address: ${evmAddress}`);
  
  /**
   * Step 4
   *
   * Transfer tokens using the `TransferTransaction` to the Etherum Account Address
   *    - The From field should be a complete account that has a public address
   *    - The To field should be to a public address (to create a new account)
   */

  //Create the sender account
  const senderPrivateKey = PrivateKey.generateECDSA();
  const senderPublicKey = senderPrivateKey.publicKey;
  
  const accountCreateTx = new AccountCreateTransaction()
      .setAliasKey(senderPublicKey)
      .setInitialBalance(new Hbar(10)) // 10 h
      .setKey(senderPublicKey)
      .freezeWith(client);

  const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
  const accountCreateTxSubmit = await accountCreateTxSign.execute(client);
  const senderAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId;
  console.log(`senderAccountId: ${senderAccountId}`);
  console.log(`evm: ${evmAddress}`);

  const txId = TransactionId.generate(operatorId)
  
  const transferTx = new TransferTransaction()
      .addHbarTransfer(senderAccountId, -10)
      .addHbarTransfer(evmAddress, 10)
      .freezeWith(client);
      
  const transferTxSign = await transferTx.sign(operatorKey);
  const transferTxSubmit = await transferTxSign.execute(client);

  /**
   * Step 5
   *
   * Get the child receipt or child record to return the Hedera Account ID for the new account that was created
   */
  console.log(await transferTxSubmit.getReceipt(client));
  
  const newAccountId = (await transferTxSubmit.getReceipt(client)).accountId;
  console.log(`record`);
  console.log(await transferTxSubmit.getRecord(client));


  /**
   * Step 6
   *
   * Get the `AccountInfo` on the new account and show it is a hollow account by not having a public key
   */
  const accountInfo = (
      await new AccountInfoQuery()
          .setAccountId(newAccountId)
          .execute(client)
  );
  console.log(`accountInfo: ${accountInfo}`);

  /**
   * Step 7
   *
   * Use the hollow account as a transaction fee payer in a HAPI transaction
   */
  const transactionId = TransactionId.generate(newAccountId);

  const newPublicKey = PrivateKey.generate().publicKey;
  let transaction = new AccountCreateTransaction()
    .setTransactionId(transactionId)
    .setInitialBalance(new Hbar(10)) // 10 h
    .setKey(newPublicKey);
  
  /**
   * Step 8
   *
   * Sign the transaction with ECDSA private key
   */
  const transactionSign = await transaction.sign(privateKey);//might need to sign with operatorKey as well
  const transactionSubmit = await transactionSign.execute(client);
  /**
   * Step 9
   *
   * Get the `AccountInfo` of the account and show the account is now a complete account by returning the public key on the account
   */
  const accountInfo2 = (
    await new AccountInfoQuery()
      .setAccountId(newAccountId)
      .execute(client)
  );
  
  console.log(`The public key of the newly created and now complete account: ${accountInfo2.key}`);

}

void main();