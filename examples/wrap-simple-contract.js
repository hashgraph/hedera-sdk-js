import {
    Client,
    PrivateKey,
    ContractWrappedCallTransaction,
    ContractDeleteTransaction,
    ContractCallQuery,
    Hbar,
    AccountId,
    ContractId, WrappedTransactionType,
} from "@hashgraph/sdk";

import * as dotenv from "dotenv";

dotenv.config();

// Import the compiled contract
import helloWorld from "./hello_world.json" assert {type: "json"};
import {toUint8Array} from "js-base64";

/**
 * @param {JSON} [jsonTransaction]
 */
async function main(jsonTransaction) {
    let client;

    try {
        client = Client.forTestnet().setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch (error) {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    // The contract bytecode is located on the `object` field
    const contractByteCode = helloWorld.object;

    // Create the contract
    const contractWrappedCallTransactionResponse = await new ContractWrappedCallTransaction()
        // Set gas to create the contract
        .setWrappedTransactionType(WrappedTransactionType.EthereumFrontier)
        // The contract bytecode must be set to the file ID containing the contract bytecode
        .setForeignTransactionBytes(toUint8Array(contractByteCode))
        .setNonce(1)
        .setFunctionParameterStart(100)
        .setFunctionParameterLength(123)
        .setContractId(new ContractId(123,234,345))
        // Set the admin key on the contract in case the contract should be deleted or
        // updated in the future
        .setGas(1000000)
        .setAmount(1000)
        .execute(client);

    // Fetch the receipt for the transaction that created the contract
    const contractReceipt = await contractWrappedCallTransactionResponse.getReceipt(
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
        .setFunction("greet")
        .setQueryPayment(new Hbar(1))
        .execute(client);

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
        .execute(client);

    // Delete the contract
    // Note: The admin key of the contract needs to sign the transaction
    // In this case the client operator is the same as the admin key so the
    // automatic signing takes care of this for you
    await contractDeleteResult.getReceipt(client);

    console.log("contract successfully deleted");
}

void main();
