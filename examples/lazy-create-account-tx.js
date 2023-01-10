import {
    AccountId,
    PrivateKey,
    Client,
    AccountInfoQuery,
    AccountCreateTransaction,
    TransactionId,
    TopicCreateTransaction,
    Wallet,
    LocalProvider,
} from "@hashgraph/sdk";
import axios from "axios";

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
  let client = Client.forLocalNode().setOperator(operatorId, operatorKey);

  /**
   * Step 1
   *
   * Create an ECSDA private key
   */
  const privateKey = PrivateKey.generateECDSA();
  console.log(`Private key: ${privateKey}`);

  /**
   * Step 2
   *
   * Extract the ECDSA public key
   */
  const publicKey = privateKey.publicKey;
  console.log(`Public key: ${publicKey}`);
  
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
  
  /**
   *
   * Step 5
   *
   * Sign the `AccountCreateTransaction` transaction using an existing Hedera account and key to pay for the transaction fee
   */
  const accountCreateTxSubmit = await accountCreateTx.execute(client);
  
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

  const accountInfo = await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(`newAccountId: ${newAccountId}`);
  console.log(`privateKey: ${privateKey}`);
  console.log(`newAccoun INFO: ${accountInfo}`);


  console.log(`Check if it is a hollow account with 'AccountInfoQuery'`);
  accountInfo.aliasKey === null && accountInfo.key === null
    ? console.log(`The newly created account is a hollow account`) : console.log(`Not a hollow account`);
  

  //check the mirror node if the account is indeed a hollow account
  //const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
  const link = `http://127.0.0.1:5551/api/v1/accounts?account.id=${newAccountId}`;
  let mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    
    
  //if the request does not succeed, wait for a bit and try again
  while (mirrorNodeAccountInfo == undefined) {
      await wait(5000);
      mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
  }
  
  console.log(`Check in the mirror node if it is a hollow account`);
  mirrorNodeAccountInfo.alias === null && mirrorNodeAccountInfo.key === null
    ? console.log(`The newly created account is a hollow account`) : console.log(`Not a hollow account`);

   /**
    *
    * Step 7
    *
    * Use a HAPI transaction and set the hollow account as the transaction fee payer
    *     - To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
    *     - Any HAPI transaction can be used to apply the public key to the hollow account and create a complete Hedera account
    */
  
  //client = Client.forLocalNode().setOperator(newAccountId, privateKey);
  const operatorWallet = new Wallet(
    process.env.OPERATOR_ID,
    process.env.OPERATOR_KEY,
    new LocalProvider()
  );
  const wallet = new Wallet(
    newAccountId,
    privateKey,
    new LocalProvider()
  );

  let evmClient = Client.forLocalNode().setOperator(newAccountId, privateKey);

  const transactionId = TransactionId.generate(newAccountId);
  /* let transaction = new AccountCreateTransaction()
    .setTransactionId(transactionId)
    .setKey(newPublicKey)
    .setInitialBalance(new Hbar(10))
    .freezeWith(client); */
  
    
  let transaction = await new TopicCreateTransaction()
    //.setTransactionId(transactionId)
    .freezeWith(evmClient)
    .sign(privateKey);

  const createResponse = await transaction.execute(evmClient);
  const createReceipt = await createResponse.getReceipt(evmClient);

  console.log(`topic id = ${createReceipt.topicId.toString()}`);

   /**
    *
    * Step 8
    *
    * Sign with the ECDSA private key that corresponds to the public address on the hollow account
    */
  //const transactionSign = await transaction.sign(privateKey);
   
   /**
    *
    * Step 9
    *
    * Execute the transaction
    */
  //await transactionSign.execute(client);
  
  /**
    *
    * Step 10
    *
    * Get the `AccountInfo` and show that the account is now a complete account i.e. returns a public key of the account
    */
  const accountInfo2 = await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(`${JSON.stringify(accountInfo2)}`);
  console.log(`The public key of the newly created and now complete account: ${accountInfo2.key}`);
}

/**
 * @param {number} timeout
 */
function wait(timeout) {
  return new Promise((resolve) => {
      setTimeout(resolve, timeout);
  });
}

void main();