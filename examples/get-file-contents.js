/**
 * Get File Contents Example using Hedera JavaScript SDK
 */

import {
    Client,
    PrivateKey,
    AccountId,
    FileContentsQuery,
    Hbar,
    FileId,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    console.log("Get File Contents Example Start!");

    // Step 1: Client and operator setup
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
    const client = Client.forName(process.env.HEDERA_NETWORK || "testnet");
    client.setOperator(operatorId, operatorKey);

    console.log("Client and operator setup complete.");

    // For this example, we'll use a known file ID. In practice, you'd use an existing file ID.
    const fileIdStr = process.env.FILE_ID;
    if (!fileIdStr) {
        throw new Error("FILE_ID not set in .env file");
    }

    try {
        // Step 2: File contents query
        const fileId = FileId.fromString(fileIdStr); // Convert fileId to FileId object
        console.log(`Querying contents of file with ID: ${fileId}`);
        const query = new FileContentsQuery()
            .setFileId(fileId)
            .setMaxQueryPayment(new Hbar(2)); // Set max payment to 2 HBAR

        // Step 3: Processing the file contents
        const contents = await query.execute(client);
        console.log("File contents retrieved successfully.");

        // Output the file contents
        console.log("File contents:");
        console.log(contents.toString("utf8")); // Convert contents to a readable string
    } catch (error) {
        // Step 5: Error handling
        console.error("Error occurred during file query:");
        if (typeof error === "object" && error !== null) {
            if ("status" in error && error.status) {
                console.error(`Hedera network status: ${String(error.status)}`);
            }
            if ("message" in error && error.message) {
                console.error(`Error message: ${error.message}`);
            }
            if ("transactionId" in error && error.transactionId) {
                console.error(
                    `Transaction ID: ${error.transactionId.toString()}`,
                );
            }
            if ("receipt" in error && error.receipt) {
                console.error(
                    `Transaction receipt: ${JSON.stringify(error.receipt, null, 2)}`,
                );
            }
        }
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
