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
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();



/* 
Lazy-create a new account using a public-address via the `AccountCreateTransaction` transaction.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1:
- Create a ECSDA private key 
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


Lazy-create a new account using a public-address via a `TransferTransaction`.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 2
- Create a ECSDA private key 
- Extract the ECDSA public key public key
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


}

void main();