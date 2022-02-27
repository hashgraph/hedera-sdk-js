import {
    Client,
    PrivateKey,
    ContractCreateTransaction,
    ContractExecuteTransaction,
    FileCreateTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    Hbar,
    AccountId,
} from "@hashgraph/sdk";

import dotenv from "dotenv";

dotenv.config();

// Import the compiled contract
import stateful from "./stateful.json";

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    // The contract bytecode is located on the `object` field
    const contractByteCode = /** @type {string} */ (stateful.object);

    // Create a file on Hedera which contains the contact bytecode.
    // Note: The contract bytecode **must** be hex encoded, it should not
    // be the actual data the hex represents
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(contractByteCode)
        .execute(client);

    // Fetch the receipt for transaction that created the file
    const fileReceipt = await fileTransactionResponse.getReceipt(client);

    // The file ID is located on the transaction receipt
    const fileId = fileReceipt.fileId;

    console.log(`contract bytecode file: ${fileId.toString()}`);

    // Create the contract
    const contractTransactionResponse = await new ContractCreateTransaction()
        // Set the parameters that should be passed to the contract constructor
        // In this case we are passing in a string with the value "hello from hedera!"
        // as the only parameter that is passed to the contract
        .setConstructorParameters(
            new ContractFunctionParameters().addString("hello from hedera!")
        )
        // Set gas to create the contract
        .setGas(75000)
        // The contract bytecode must be set to the file ID containing the contract bytecode
        .setBytecodeFileId(fileId)
        // Set the admin key on the contract in case the contract should be deleted or
        // updated in the future
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    // Fetch the receipt for the transaction that created the contract
    const contractReceipt = await contractTransactionResponse.getReceipt(
        client
    );

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
        .setFunction("get_message")
        .setQueryPayment(new Hbar(1))
        .execute(client);

    // Check if an error was returned
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

    // Call a method on a contract exists on Hedera, but is allowed to mutate the contract state
    const contractExecTransactionResponse =
        await new ContractExecuteTransaction()
            // Set which contract
            .setContractId(contractId)
            // Set the gas to execute the contract call
            .setGas(75000)
            // Set the function to call and the parameters to send
            // in this case we're calling function "set_message" with a single
            // string paramater of value "hello from hedera again!"
            // If instead the "set_message" method were to require "string[], uint32, string"
            // parameters then you must do:
            //      new ContractFunctionParameters()
            //          .addStringArray(["string 1", "string 2"])
            //          .addUint32(1)
            //          .addString("string 3")
            .setFunction(
                "set_message",
                new ContractFunctionParameters().addString(
                    "hello from hedera again!"
                )
            )
            .execute(client);

    await contractExecTransactionResponse.getReceipt(client);

    // Call a method on a contract that exists on Hedera
    const contractUpdateResult = await new ContractCallQuery()
        // Set which contract
        .setContractId(contractId)
        // Set gas to use
        .setGas(75000)
        // Set the function to call on the contract
        .setFunction("get_message")
        // Set the query payment explicitly since sometimes automatic payment calculated
        // is too low
        .setQueryPayment(new Hbar(3))
        .execute(client);

    // Check if there were any errors
    if (
        contractUpdateResult.errorMessage != null &&
        contractUpdateResult.errorMessage != ""
    ) {
        console.log(
            `error calling contract: ${contractUpdateResult.errorMessage}`
        );
        return;
    }

    // Get a string from the result at index 0
    const message2 = contractUpdateResult.getString(0);
    console.log(`contract returned message: ${message2}`);
}

void main();
