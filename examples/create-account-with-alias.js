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
import axios from "axios";

import dotenv from "dotenv";

dotenv.config();


/* 
Create an account and set a public key alias. 

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1:
- Create an ECDSA private key
- Get the ECDSA public key 
- Use the `AccountCreateTransaction` and populate the `setAliasKey` field
- Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
- Execute the transaction
- Return the Hedera account ID from the receipt of the transaction
- Get the `AccountInfo` using the new account ID
- Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
- Show the public key and the public key alias are the same on the account
- Show this account has a corresponding EVM address in the mirror node



## Example 2:
- Create an ED2519 private key
- Get the ED2519 public key 
- Use the `AccountCreateTransaction` and populate the `setAliasKey` field
- Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
- Execute the transaction
- Return the Hedera account ID from the receipt of the transaction
- Get the `AccountInfo` using the new account ID
- Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
- Show the public key and the public key alias are the same on the account
- Show this account has a corresponding EVM address in the mirror node
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

    /** Example 1
     * 
     * Step 1
     *
     * Create an ECSDA private key
     */
    const privateKey = PrivateKey.generateECDSA();
    
    /**
     * Step 2
     *
     * Get the ECDSA public key 
     */
    const publicKey = privateKey.publicKey;
  
    /**
     * Step 3
     *
     * Use the `AccountCreateTransaction` and populate the `setAliasKey` field
     */
    const accountCreateTx = new AccountCreateTransaction()
        .setAliasKey(publicKey)
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(publicKey)
        .freezeWith(client);

    /**
     * Step 4
     *
     * Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
     */
    const accountCreateTxSign = await accountCreateTx.sign(operatorKey)
    
    /**
     * Step 5
     *
     * Execute the transaction
     */
    const accountCreateTxSubmit = await accountCreateTxSign.execute(client);
    
    /**
     * Step 6
     *
     * Return the Hedera account ID from the receipt of the transaction
     */
    const newAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId.toString();
    console.log(newAccountId);
    
    /**
     * Step 7
     *
     * Get the `AccountInfo` using the new account ID
     */
    const accountInfo = (
        await new AccountInfoQuery()
            .setAccountId(newAccountId)
            .execute(client)
    );
    console.log(`accountInfo: ${accountInfo}`);

    /**
     * Step 8
     *
     * Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
     */
    const aliasPublicKey = publicKey.toAccountId(0, 0);
    const accountInfoAlias = (
        await new AccountInfoQuery()
            .setAccountId(aliasPublicKey)
            .execute(client)
    );
    console.log(`accountInfo: ${accountInfoAlias}`);

    /**
     * Step 9
     *
     * Show the public key and the public key alias are the same on the account
     */
    console.log(`accountInfo.key: ${accountInfo.key}`)
    console.log(`accountInfo.aliasKey: ${accountInfo.aliasKey}`)
    console.log(`accountInfoAlias.key: ${accountInfoAlias.key}`)
    console.log(`accountInfoAlias.aliasKey: ${accountInfoAlias.aliasKey}`)

    /**
     * Step 10
     *
     * Show this account has a corresponding EVM address in the mirror node
     */
    //wait 3 seconds until the data is present in the mirror
    await wait(3000);
    
    const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
    const mirrorNodeAccountInfo = await axios.get(link);
    console.log(mirrorNodeAccountInfo.data.accounts[0]);

    const mirrorNodeEvmAddress = mirrorNodeAccountInfo.data.accounts[0].evm_address;
    
    mirrorNodeEvmAddress !== null
        ? console.log(`The account has a corresponding EVM address in the mirror node`)
        : console.log(`The EVM address of the account is missing in the mirror node`)


    
    /** Example 2
     * 
     * Step 1
     *
     * Create an ED25519 private key
     */
    const privateKey2 = PrivateKey.generateED25519();
    
    /**
     * Step 2
     *
     * Get the ED25519 public key
     */
    const publicKey2 = privateKey2.publicKey;
  
    /**
     * Step 3
     *
     * Use the `AccountCreateTransaction` and populate the `setAliasKey` field
     */
    const accountCreateTx2 = new AccountCreateTransaction()
        .setAliasKey(publicKey2)
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(publicKey2)
        .freezeWith(client);

    /**
     * Step 4
     *
     * Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
     */
    const accountCreateTxSign2 = await accountCreateTx2.sign(operatorKey)
    
    /**
     * Step 5
     *
     * Execute the transaction
     */
    const accountCreateTxSubmit2 = await accountCreateTxSign2.execute(client);
    
    /**
     * Step 6
     *
     * Return the Hedera account ID from the receipt of the transaction
     */
    const newAccountId2 = (await accountCreateTxSubmit2.getReceipt(client)).accountId.toString();
    console.log(newAccountId2);
    
    /**
     * Step 7
     *
     * Get the `AccountInfo` using the new account ID
     */
    const accountInfo2 = (
        await new AccountInfoQuery()
            .setAccountId(newAccountId2)
            .execute(client)
    );
    console.log(`accountInfo: ${accountInfo2}`);

    /**
     * Step 8
     *
     * Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
     */
    const aliasPublicKey2 = publicKey2.toAccountId(0, 0);
    const accountInfoAlias2 = (
        await new AccountInfoQuery()
            .setAccountId(aliasPublicKey2)
            .execute(client)
    );
    console.log(`accountInfo: ${accountInfoAlias2}`);

    /**
     * Step 9
     *
     * Show the public key and the public key alias are the same on the account
     */
    console.log(`accountInfo2.key: ${accountInfo2.key}`)
    console.log(`accountInfo2.aliasKey: ${accountInfo2.aliasKey}`)
    console.log(`accountInfoAlias2.key: ${accountInfoAlias2.key}`)
    console.log(`accountInfoAlias2.aliasKey: ${accountInfoAlias2.aliasKey}`)
    
    /**
     * Step 10
     *
     * Show this account has a corresponding EVM address in the mirror node
     */
    //wait 3 seconds until the data is present in the mirror
    await wait(3000);

    const link2 = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId2}`;
    const mirrorNodeAccountInfo2 = await axios.get(link2);
    console.log(mirrorNodeAccountInfo2.data.accounts[0]);

    const mirrorNodeEvmAddress2 = mirrorNodeAccountInfo2.data.accounts[0].evm_address;
    
    mirrorNodeEvmAddress2 !== null
        ? console.log(`The account has a corresponding EVM address in the mirror node`)
        : console.log(`The EVM address of the account is missing in the mirror node`)
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