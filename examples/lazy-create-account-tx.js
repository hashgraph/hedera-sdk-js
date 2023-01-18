import {
    AccountId,
    PrivateKey,
    Client,
    AccountInfoQuery,
    AccountCreateTransaction,
    TopicCreateTransaction,
    Hbar,
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

  const client = Client.forPreviewnet().setOperator(operatorId, operatorKey);

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
    .setInitialBalance(new Hbar(10))
    .freezeWith(client);
  
  /**
   *
   * Step 5
   *
   * Sign the `AccountCreateTransaction` transaction using an existing Hedera account and key to pay for the transaction fee
   */
  const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
  const accountCreateTxSubmit = await accountCreateTxSign.execute(client);
  const newAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId.toString();

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
  const hollowAccountInfo = await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client);

  console.log(`Check if it is a hollow account with 'AccountInfoQuery'`);
  hollowAccountInfo.aliasKey === null && hollowAccountInfo.key._toProtobufKey().keyList.keys.length == 0 && hollowAccountInfo.contractAccountId !== null
    ? console.log(`The newly created account is a hollow account`)
    : console.log(`Not a hollow account`);
  

  // check the mirror node if the account is indeed a hollow account
  const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
  try {
    let mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    
    // if the request does not succeed, wait for a bit and try again
    // the mirror node needs some time to be up to date
    while (mirrorNodeAccountInfo == undefined) {
      await wait(5000);
      mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    }
  
    console.log(`Check in the mirror node if it is a hollow account`);
    console.log(mirrorNodeAccountInfo);
    mirrorNodeAccountInfo.alias === null && mirrorNodeAccountInfo.key === null && mirrorNodeAccountInfo.evm_address !== null
      ? console.log(`The newly created account is a hollow account`)
      : console.log(`Not a hollow account`);
  } catch (e) {
    console.log(e);
  }
  /**
  *
  * Step 7
  *
  * Use a HAPI transaction and set the hollow account as the transaction fee payer
  *     - To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
  *     - Any HAPI transaction can be used to apply the public key to the hollow account and create a complete Hedera account
  */
  
  // set the accound id of the hollow account and its private key as an operator
  // in order to be a transaction fee payer in a HAPI transaction
  client.setOperator(newAccountId, privateKey);

  let transaction = new TopicCreateTransaction()
    .setTopicMemo("HIP-583")
    .freezeWith(client)
    
  /**
  *
  * Step 8
  *
  * Sign with the ECDSA private key that corresponds to the public address on the hollow account
  */
  const transactionSign = await transaction.sign(privateKey);
   
  /**
  *
  * Step 9
  *
  * Execute the transaction
  */
  const transactionSubmit = await transactionSign.execute(client);
  const status = (await transactionSubmit.getReceipt(client)).status.toString();
  console.log(`HAPI transaction status: ${status}`);

  /**
  *
  * Step 10
  *
  * Get the `AccountInfo` and show that the account is now a complete account i.e. returns a public key of the account
  */
  const completeAccountInfo = await new AccountInfoQuery()
    .setAccountId(newAccountId)
    .execute(client);

  completeAccountInfo.key !== null
    ? console.log(`The public key of the newly created and now complete account: ${completeAccountInfo.key}`)
    : console.log(`Account ${newAccountId} is still a hollow account`);
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