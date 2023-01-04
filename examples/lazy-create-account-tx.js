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
*/


async function main() {


}

void main();