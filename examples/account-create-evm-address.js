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
Create an account and set an EVM address using the `AccountCreateTransaction`

Reference: [HIP-583 Expand alias support in CryptoCreate & CryptoTransfer Transactions](https://hips.hedera.com/hip/hip-583)

## Example 1
- Create an ECSDA private key
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
     * Step 4
     *
     * Use the `AccountCreateTransaction` and set the EVM address field to the Ethereum public address
     */
    const accountCreateTx = new AccountCreateTransaction()
        .setEvmAddress(evmAddress)
        .freezeWith(client);

    /**
     * Step 5
     *
     * Sign the transaction with the key that us paying for the transaction
     */
    const accountCreateTxSign = await accountCreateTx.sign(operatorKey);
    const accountCreateTxSubmit = await accountCreateTxSign.execute(client);
    
    /**
     * Step 6
     *
     * Get the account ID from the receipt
     */
    const newAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId.toString();
    console.log(`Account ID of the newly created account: ${newAccountId}`);
    
    /**
     * Step 7
     *
     * Get the `AccountInfo` and return the account details
     */
    const accountInfo = (
        await new AccountInfoQuery()
            .setAccountId(newAccountId)
            .execute(client)
    );
    const accountInfoEvmAddress = accountInfo.contractAccountId;

    /**
     * Step 8
     *
     * Verify the evm address provided for the account matches what is in the mirror node
     */
    const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
    try {
        let mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
    
        // if the request does not succeed, wait for a bit and try again
        // the mirror node needs some time to be up to date
        while (mirrorNodeAccountInfo == undefined) {
            await wait(5000);
            mirrorNodeAccountInfo = (await axios.get(link)).data.accounts[0];
        }

        // here we use .substring(2) because the mirror node returns the evm address with `0x` prefix
        const mirrorNodeEvmAddress = mirrorNodeAccountInfo.evm_address.substring(2);

        // check if the generated evm address matches the evm addresses taken from `AccountInfoQuery` and the mirror node
        evmAddress === mirrorNodeEvmAddress && evmAddress === accountInfoEvmAddress
            ? console.log(`The evm address provided for the account matches the one in the mirror node and the one from 'AccountInfoQuery'`)
            : console.log(`The evm addresses does not match`)
    } catch (e) {
        console.log(e);
    }
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