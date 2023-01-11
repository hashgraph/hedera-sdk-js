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
    TransactionId,
    Timestamp,
} from "@hashgraph/sdk";
import axios from "axios";

import dotenv from "dotenv";

dotenv.config();



/*
Lazy-create a new account using a public-address via a `TransferTransaction`.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 2
- Create an ECSDA private key 
- Extract the ECDSA public key
- Extract the Ethereum public address
  - Add function to calculate the Ethereum Address to in SDK
  - Ethereum account address / public-address - This is the rightmost 20 bytes of the 32 byte Keccak-256 hash of the ECDSA public key of the account. This calculation is in the manner described by the Ethereum Yellow Paper.
- Use the `TransferTransaction` 
   - Populate the `FromAddress` with the sender Hedera AccountID
   - Populate the `ToAddress` with Ethereum public address
   - Note: Can transfer from public address to public address in the `TransferTransaction` for complete accounts. Transfers from hollow accounts will not work because the hollow account does not have a public key assigned to authorize transfers out of the account
- Sign the `TransferTransaction` transaction using an existing Hedera account and key paying for the transaction fee
- The `AccountCreateTransaction` is executed as a child transaction triggered by the `TransferTransaction`
- The Hedera Account that was created has a public address the user specified in the TransferTransaction ToAddress
       - Will not have a public key at this stage
       - Cannot do anything besides receive tokens or hbars
       - The alias property of the account does not have the public address
       - Referred to as a hollow account
- To get the new account ID ask for the child receipts or child records for the parent transaction ID of the `TransferTransaction`
- Get the `AccountInfo` and verify the account is a hollow account with the supplied public address (may need to verify with mirror node API)
- To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
- Create a HAPI transaction and assign the new hollow account as the transaction fee payer
- Sign with the private key that corresponds to the public key on the hollow account
- Get the `AccountInfo` for the account and return the public key on the account to show it is a complete account
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
  console.log(`New account ID: ${evmAddress}`);
  
  /**
   *
   * Step 4
  *
  * Use the `TransferTransaction` 
  *   - Populate the `FromAddress` with the sender Hedera AccountID
  *   - Populate the `ToAddress` with Ethereum public address
  */
  const transferTx = new TransferTransaction()
    .addHbarTransfer(operatorId, -10)
    .addHbarTransfer(evmAddress, 10)
    .freezeWith(client);
 
 /**
  *
  * Step 5
  *
  * Sign the `TransferTransaction` transaction using an existing Hedera account and key paying for the transaction fee
  */
 const transferTxSign = await transferTx.sign(operatorKey);
 const transferTxSubmit = await transferTxSign.execute(client);
 
 /**
  *
  * Step 6
  *
  * To get the new account ID ask for the child receipts or child records for the parent transaction ID of the `TransferTransaction`
  *     - The `AccountCreateTransaction` is executed as a child transaction triggered by the `TransferTransaction`
  */

 //need to get from the child transaction
 const record = await transferTxSubmit.getRecord(client);
 console.log(record);

 /**
  *
  * Step 7
  *
  * Get the `AccountInfo` and verify the account is a hollow account with the supplied public address (may need to verify with mirror node API)
  * 
  * The Hedera Account that was created has a public address the user specified in the TransferTransaction ToAddress
       - Will not have a public key at this stage
       - Cannot do anything besides receive tokens or hbars
       - The alias property of the account does not have the public address
       - Referred to as a hollow account
  */
  const newAccountId = (await transferTxSubmit.getReceipt(client)).accountId;
  const accountInfo = (
      await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client)
  );

  console.log(`Check if it is a hollow account with 'AccountInfoQuery'`);
  accountInfo.aliasKey === null && accountInfo.key === null
    ? console.log(`The newly created account is a hollow account`) : console.log(`Not a hollow account`);
  
  //check the mirror node if the account is indeed a hollow account
  const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
  try {
    let mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    
    //if the request does not succeed, wait for a bit and try again
    while (mirrorNodeAccountInfo == undefined) {
        await wait(5000);
        mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    }

    console.log(`Check in the mirror node if it is a hollow account`);
    mirrorNodeAccountInfo.alias === null && mirrorNodeAccountInfo.key === null
      ? console.log(`The newly created account is a hollow account`)
      : console.log(`Not a hollow account`);

  } catch (e) {
    console.log(e);
  }

  /**
  *
  * Step 8
  *
  * Create a HAPI transaction and assign the new hollow account as the transaction fee payer
  *     - To enhance the hollow account to have a public key the hollow account needs to be specified as a transaction fee payer in a HAPI transaction
  */
  const transactionId = TransactionId.generate(newAccountId);
  
  const returnTransferTx = new TransferTransaction()
    .setTransactionId(transactionId)
    .addHbarTransfer(newAccountId, -10)
    .addHbarTransfer(operatorId, 10)

  /**
  *
  * Step 9
  *
  * Sign with the private key that corresponds to the public key on the hollow account
  */
  const returnTransferTxSign = await returnTransferTx.sign(privateKey);//might need to sign with operatorKey as well
  const returnTransferTxSubmit = await returnTransferTxSign.execute(client);

  /**
  *
  * Step 10
  *
  * Get the `AccountInfo` for the account and return the public key on the account to show it is a complete account
  */
  const accountInfo2 = (
      await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client)
  );
  
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