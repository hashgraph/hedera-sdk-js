import {
    Wallet,
    LocalProvider,
    ContractCreateTransaction,
    FileCreateTransaction,
    ContractDeleteTransaction,
    ContractCallQuery,
    Hbar,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

// Import the compiled contract
import helloWorld from "./hello_world.json";

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const wallet = new Wallet(
        process.env.OPERATOR_ID,
        process.env.OPERATOR_KEY,
        new LocalProvider()
    );

    // The contract bytecode is located on the `object` field
    const contractByteCode = helloWorld.object;

    // Create a file on Hedera which contains the contact bytecode.
    // Note: The contract bytecode **must** be hex encoded, it should not
    // be the actual data the hex represents
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([wallet.getAccountKey()])
        .setContents(contractByteCode)
        .executeWithSigner(wallet);

    // Fetch the receipt for transaction that created the file
    const fileReceipt = await fileTransactionResponse.getReceiptWithSigner(
        wallet
    );

    // The file ID is located on the transaction receipt
    const fileId = fileReceipt.fileId;

    console.log(`contract bytecode file: ${fileId.toString()}`);

    // Create the contract
    const contractTransactionResponse = await new ContractCreateTransaction()
        // Set gas to create the contract
        .setGas(75000)
        // The contract bytecode must be set to the file ID containing the contract bytecode
        .setBytecodeFileId(fileId)
        // Set the admin key on the contract in case the contract should be deleted or
        // updated in the future
        .setAdminKey(wallet.getAccountKey())
        .executeWithSigner(wallet);

    // Fetch the receipt for the transaction that created the contract
    const contractReceipt =
        await contractTransactionResponse.getReceiptWithSigner(wallet);

    // The conract ID is located on the transaction receipt
    const contractId = contractReceipt.contractId;

    console.log(`new contract ID: ${contractId.toString()}`);

    // Call a method on a contract that exists on Hedera
    // Note: `ContractCallQuery` cannot mutate a contract, it will only return the last state
    // of the contract
    const contractCallResult = await new ContractCallQuery()
        // Set the gas to execute a contract call
        .setGas(75000)
        // Set which contract
        .setContractId(contractId)
        // Set the function to call on the contract
        .setFunction("greet")
        .setQueryPayment(new Hbar(1))
        .executeWithSigner(wallet);

    if (
        contractCallResult.errorMessage != null &&
        contractCallResult.errorMessage != ""
    ) {
        console.log(
            `error calling contract: ${contractCallResult.errorMessage}`
        );
    }

    // Get the message from the result
    // The `0` is the index to fetch a particular type from
    //
    // e.g.
    // If the return type of `get_message` was `(string[], uint32, string)`
    // then you'd need to get each field separately using:
    //      const stringArray = contractCallResult.getStringArray(0);
    //      const uint32 = contractCallResult.getUint32(1);
    //      const string = contractCallResult.getString(2);
    const message = contractCallResult.getString(0);
    console.log(`contract message: ${message}`);

    const contractDeleteResult = await new ContractDeleteTransaction()
        .setContractId(contractId)
        .executeWithSigner(wallet);

    // Delete the contract
    // Note: The admin key of the contract needs to sign the transaction
    // In this case the client operator is the same as the admin key so the
    // automatic signing takes care of this for you
    await contractDeleteResult.getReceiptWithSigner(wallet);

    console.log("contract successfully deleted");
}

void main();
