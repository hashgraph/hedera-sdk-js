import {
    AccountId,
    PrivateKey,
    Client,
    AccountInfoQuery,
    AccountCreateTransaction,
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
     * Example 1
     *
     * Step 1
     *
     * Create an ECSDA private key
     */
    console.log(`\nExample 1: \n`);
    const privateKey = PrivateKey.generateECDSA();
    console.log(`Private key: ${privateKey.toStringDer()}`);

    /**
     * Step 2
     *
     * Get the ECDSA public key
     */
    const publicKey = privateKey.publicKey;
    console.log(`Public key: ${publicKey.toStringDer()}`);

    /**
     * Step 3
     *
     * Use the `AccountCreateTransaction` and populate the `setAliasKey` field
     */
    const accountCreateTx = new AccountCreateTransaction()
        .setAliasKey(publicKey)
        .freezeWith(client);

    /**
     * Step 4
     *
     * Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
     */
    const accountCreateTxSign = await accountCreateTx.sign(operatorKey);

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
    const newAccountId = (
        await accountCreateTxSubmit.getReceipt(client)
    ).accountId.toString();
    console.log(`Account id of the new account: ${newAccountId}`);

    /**
     * Step 7
     *
     * Get the `AccountInfo` using the new account ID
     */
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client);

    /**
     * Step 8
     *
     * Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
     */
    const aliasPublicKey = publicKey.toAccountId(0, 0);
    const accountInfoAlias = await new AccountInfoQuery()
        .setAccountId(aliasPublicKey)
        .execute(client);

    /**
     * Step 9
     *
     * Show the public key and the public key alias are the same on the account
     */
    accountInfo.key.toString() === accountInfo.aliasKey.toString() &&
    accountInfo.aliasKey.toString() === accountInfoAlias.key.toString() &&
    accountInfoAlias.key.toString() === accountInfoAlias.aliasKey.toString()
        ? console.log(`The public key and the public key alias are the same`)
        : console.log(`The public key and the public key alias differ`);

    /**
     * Step 10
     *
     * Show this account has a corresponding EVM address in the mirror node
     */

    const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        let mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];

        // if the request does not succeed, wait for a bit and try again
        // the mirror node needs some time to be up to date
        while (mirrorNodeAccountInfo == undefined) {
            await wait(5000);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
            mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
        }
        /**@type {string} */
        const mirrorNodeEvmAddress = mirrorNodeAccountInfo.evm_address; // eslint-disable-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access

        mirrorNodeEvmAddress !== null
            ? console.log(
                  `The account has a corresponding EVM address in the mirror node: ${mirrorNodeEvmAddress}`
              )
            : console.log(
                  `The EVM address of the account is missing in the mirror node`
              );
    } catch (e) {
        console.log(e);
    }

    /**
     * Example 2
     *
     * Step 1
     *
     * Create an ED25519 private key
     */
    console.log(`\nExample 2: \n`);
    const privateKey2 = PrivateKey.generateED25519();
    console.log(`Private key: ${privateKey2.toString()}`);

    /**
     * Step 2
     *
     * Get the ED25519 public key
     */
    const publicKey2 = privateKey2.publicKey;
    console.log(`Public key: ${publicKey2.toString()}`);

    /**
     * Step 3
     *
     * Use the `AccountCreateTransaction` and populate the `setAliasKey` field
     */
    const accountCreateTx2 = new AccountCreateTransaction()
        .setAliasKey(publicKey2)
        .freezeWith(client);

    /**
     * Step 4
     *
     * Sign the `AccountCreateTransaction` using an existing Hedera account and key to pay for the transaction fee
     */
    const accountCreateTxSign2 = await accountCreateTx2.sign(operatorKey);

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
    const newAccountId2 = (
        await accountCreateTxSubmit2.getReceipt(client)
    ).accountId.toString();
    console.log(`Account id of the new account: ${newAccountId2}`);

    /**
     * Step 7
     *
     * Get the `AccountInfo` using the new account ID
     */
    const accountInfo2 = await new AccountInfoQuery()
        .setAccountId(newAccountId2)
        .execute(client);

    /**
     * Step 8
     *
     * Get the `AccountInfo` using the account public key in `0.0.aliasPublicKey` format
     */
    const aliasPublicKey2 = publicKey2.toAccountId(0, 0);
    const accountInfoAlias2 = await new AccountInfoQuery()
        .setAccountId(aliasPublicKey2)
        .execute(client);

    /**
     * Step 9
     *
     * Show the public key and the public key alias are the same on the account
     */
    accountInfo2.key.toString() === accountInfo2.aliasKey.toString() &&
    accountInfo2.aliasKey.toString() === accountInfoAlias2.key.toString() &&
    accountInfoAlias2.key.toString() === accountInfoAlias2.aliasKey.toString()
        ? console.log(`The public key and the public key alias are the same`)
        : console.log(`The public key and the public key alias differ`);
}

/**
 * @param {number} timeout
 * @returns {Promise<any>}
 */
function wait(timeout) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

void main();
