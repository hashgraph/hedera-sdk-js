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
Transfer HBAR or tokens to a Hedera account using their public-address.

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1
- Create a ECSDA private key 
- Extract the ECDSA public key public key
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


}

void main();