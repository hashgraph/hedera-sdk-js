import {
    Client,
    PrivateKey,
    AccountId,
    FileContentsQuery,
    Hbar,
    FileCreateTransaction,
    FileDeleteTransaction,
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
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

    // Create a client for the local Hedera network
    const node = { [process.env.HEDERA_NETWORK]: new AccountId(3) };
    const client = Client.forNetwork(node);

    client.setOperator(operatorId, operatorKey);

    // Increase the timeout settings
    client.setRequestTimeout(60000); // Set timeout to 60 seconds

    console.log("Client and operator setup complete.");

    /**
     * Step 1: Submit the file create transaction
     */

    // Content to be stored in the file.
    const fileContents = Buffer.from("Hedera is great!", "utf-8");

    try {
        console.log("Creating new file...");

        // Create the transaction
        const transaction = new FileCreateTransaction()
            .setKeys([operatorKey.publicKey]) // The public key of the owner of the file.
            .setContents(fileContents)
            .setMaxTransactionFee(new Hbar(2)); // Change the default max transaction fee to 2 hbars

        // Freeze the transaction, sign with the key on the file and the client operator key, then submit to a Hedera network
        const txId = await transaction.execute(client);

        // Request the receipt
        const receipt = await txId.getReceipt(client);

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
        console.error("Error occurred during file creation:", error.message);
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