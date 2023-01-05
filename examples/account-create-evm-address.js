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

    const client = Client.forTestnet().setOperator(operatorId, operatorKey);
    //const client = Client.forLocalNode().setOperator(operatorId, operatorKey);

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
    console.log(`Account evm address: ${evmAddress}`);
    
    /**
     * Step 4
     *
     * Use the `AccountCreateTransaction` and set the EVM address field to the Ethereum public address
     */
    let accountCreateTx = new AccountCreateTransaction()
        .setEvmAddress(evmAddress)
        .setInitialBalance(new Hbar(10)) // 10 h
        .setKey(publicKey)
        .freezeWith(client);

    /**
     * Step 5
     *
     * Sign the transaction with the key that us paying for the transaction
     */
    let accountCreateTxSign = await accountCreateTx.sign(operatorKey)
    let accountCreateTxSubmit = await accountCreateTxSign.execute(client);
    
    /**
     * Step 6
     *
     * Get the account ID from the receipt
     */
    let newAccountId = (await accountCreateTxSubmit.getReceipt(client)).accountId.toString();

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
    console.log(`Account info: ${accountInfo}`);
    
    //wait 3 seconds until the data is present in the mirror
    await wait(3000);
    /**
     * Step 8
     *
     * Verify the evm address provided for the account matches what is in the mirror node
     */
    const link = `https://${process.env.HEDERA_NETWORK}.mirrornode.hedera.com/api/v1/accounts?account.id=${newAccountId}`;
    const mirrorNodeAccountInfo = await axios.get(link);
    console.log(mirrorNodeAccountInfo.data.accounts[0]);

    const mirrorNodeEvmAddress = mirrorNodeAccountInfo.data.accounts[0].evm_address;
    
    evmAddress === mirrorNodeEvmAddress
        ? console.log(`The evm address provided for the account matches the one in the mirror node`)
        : console.log(`The two evm addresses does not match`)
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