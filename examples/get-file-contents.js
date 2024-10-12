import {
    PrivateKey,
    FileContentsQuery,
    Hbar,
    FileCreateTransaction,
    FileDeleteTransaction,
    Client,
    AccountId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

/**
 * How to get file contents
 *
 */

async function main() {
    /**
     * Step 0:
     * Create and configure the SDK Client
     */
    if (
        process.env.OPERATOR_ID == null ||
        process.env.OPERATOR_KEY == null ||
        process.env.HEDERA_NETWORK == null
    ) {
        throw new Error(
            "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.",
        );
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

    // Create a client for the local Hedera network
    const client = Client.forNetwork({ "127.0.0.1:50211": new AccountId(3) });
    client.setOperator(operatorId, operatorKey);

    // Increase the timeout settings
    client.setRequestTimeout(120000);

    /**
     * Step 1: Submit the file create transaction
     */

    // Content to be stored in the file.
    const fileContents = Buffer.from("Hedera is great!", "utf-8");

    try {
        console.log("Creating new file...");

        // Create the transaction
        let transaction = new FileCreateTransaction()
            .setKeys([operatorKey.publicKey]) // The public key of the owner of the file.
            .setContents(fileContents)
            .setMaxTransactionFee(new Hbar(2)) // Change the default max transaction fee to 2 hbars
            .freezeWith(client); // Freeze with client

        transaction = await transaction.sign(operatorKey);

        const response = await transaction.execute(client);

        const receipt = await response.getReceipt(client);

        // Get the file ID
        const newFileId = receipt.fileId;

        if (newFileId) {
            console.log(`Created new file with ID: ${newFileId.toString()}`);
        } else {
            throw new Error("Failed to retrieve new file ID");
        }

        /**
         * Step 2: Get file contents and print them
         */

        const fileContentsQuery = await new FileContentsQuery()
            .setFileId(newFileId)
            .execute(client);

        if (fileContentsQuery) {
            console.log("File contents: " + fileContentsQuery.toString());
        } else {
            throw new Error("Failed to retrieve file contents");
        }

        // Clean up: Delete created file
        const fileDeleteTxResponse = await new FileDeleteTransaction()
            .setFileId(newFileId)
            .execute(client);

        await fileDeleteTxResponse.getReceipt(client);

        console.log("File deleted successfully");
    } catch (error) {
        console.error("Error occurred during file creation:", error);
    } finally {
        // Close the client
        client.close();
        console.log("Get File Contents Example Complete!");
    }
}

main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
