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
Lazy-create a new account using a public-address via the `AccountCreateTransaction` transaction.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1:
- Create an ECSDA private key 
- Extract the ECDSA public key
- Extract the Ethereum public address
  - Add function in the SDK to calculate the Ethereum Address 
  - Ethereum account address / public-address - This is the rightmost 20 bytes of the 32 byte Keccak-256 hash of the ECDSA public key of the account. This calculation is in the manner described by the Ethereum Yellow Paper.
- Use the `AccountCreateTransaction` and populate `setEvmAddress(publicAddress)` field with the Ethereum public address
- Sign the `AccountCreateTransaction` transaction using an existing Hedera account and key to pay for the transaction fee
- The Hedera account that was created has a public address the user specified in the `AccountCreateTransaction`
       - Will not have a Hedera account public key at this stage
       - The account can only receive tokens or hbars 
       - This is referred to as a hollow account
       - The alias property of the account will not have the public address
- Get the `AccountInfo` of the account and show that it is a hollow account i.e. does not have a public key
- To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
- Any HAPI transaction can be used to apply the public key to the hollow account and create a complete Hedera account
- Use a HAPI transaction and set the hollow account as the transaction fee payer
- Sign with the ECDSA private key that corresponds to the public address on the hollow account
- Execute the transaction
- Get the `AccountInfo` and show that the account is now a complete account i.e. returns a public key of the account
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
  console.log(`Account evm address: ${evmAddress}`);
  
  /**
   *
   * Step 4
   *
   * Use the `AccountCreateTransaction` and populate `setEvmAddress(publicAddress)` field with the Ethereum public address
   */
  const accountCreateTx = new AccountCreateTransaction()
    .setEvmAddress(evmAddress)
    .setInitialBalance(new Hbar(10)) // 10 h
    .setKey(publicKey)
    .freezeWith(client);
  
  /**
   *
   * Step 5
   *
   * Sign the `AccountCreateTransaction` transaction using an existing Hedera account and key to pay for the transaction fee
   */
  const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
  const accountCreateTxSubmit = await accountCreateTxSign.execute(client);
  
  /**
   *
   * Step 6
  *
  * Get the `AccountInfo` of the account and show that it is a hollow account i.e. does not have a public key 
  * 
  * The Hedera account that was created has a public address the user specified in the `AccountCreateTransaction`
  *     - Will not have a Hedera account public key at this stage
  *     - The account can only receive tokens or hbars 
  *     - This is referred to as a hollow account
  *     - The alias property of the account will not have the public address
  */
  const newAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId;
 
  const accountInfo = (
    await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client)
  );
  console.log(`Account info: ${accountInfo}`);
   
   /**
    *
    * Step 7
    *
    * Use a HAPI transaction and set the hollow account as the transaction fee payer
    *     - To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
    *     - Any HAPI transaction can be used to apply the public key to the hollow account and create a complete Hedera account
    */
  const transactionId = TransactionId.generate(newAccountId);
  
  const newPublicKey = PrivateKey.generate().publicKey;
  let transaction = new AccountCreateTransaction()
    .setTransactionId(transactionId)
    .setInitialBalance(new Hbar(10)) // 10 h
    .setKey(newPublicKey);
   
   /**
    *
    * Step 8
    *
    * Sign with the ECDSA private key that corresponds to the public address on the hollow account
    */
  const transactionSign = await transaction.sign(privateKey);//might need to sign with operatorKey as well
   
   /**
    *
    * Step 9
    *
    * Execute the transaction
    */
  const transactionSubmit = await transactionSign.execute(client);
   
   /**
    *
    * Step 10
    *
    * Get the `AccountInfo` and show that the account is now a complete account i.e. returns a public key of the account
    */
  const accountInfo2 = (
  await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client)
  );

  console.log(`The public key of the newly created and now complete account: ${accountInfo2.key}`);
}

void main();