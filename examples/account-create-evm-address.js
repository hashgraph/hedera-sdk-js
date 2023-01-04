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
Create an account and set an EVM address using the `AccountCreateTransaction`

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1
- Create a ECSDA private key
- Extract the ECDSA public key
- Extract the Ethereum public address
- Add function in the SDK to calculate the Ethereum Address
- Ethereum account address / public-address - This is the rightmost 20 bytes of the 32 byte Keccak-256 hash of the ECDSA public key of the account. This calculation is in the manner described by the Ethereum Yellow Paper.
- Use the `AccountCreateTransaction` and set the EVM address field to the Ethereum public address
- Sign the transaction with the key that us paying for the transaction
- Get the account ID from the receipt
- Get the `AccountInfo` and return the account details
- Verify the evm address provided for the account matches what is in the mirror node
*/

async function main() {
    // Configure accounts and client, and generate needed keys
    const supplyKey = PrivateKey.generateECDSA();
    const freezeKey = PrivateKey.generateECDSA();
    const wipeKey = PrivateKey.generateECDSA();

    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    /**
     *
     * Step 1
     *
     * Create a ECSDA private key
     */
    const privateKey = PrivateKey.generateECDSA();
    
    /**
     *
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
     * Step 3
     *
     * Use the `AccountCreateTransaction` and set the EVM address field to the Ethereum public address
     */
    let transaction = await new AccountCreateTransaction()
        .setEvmAddress(evmAddress)
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(publicKey)
        .signWithOperator(client);

    let result = await transaction.execute(client);

    console.log(`exit`)
    process.exit(0);
}

void main();
