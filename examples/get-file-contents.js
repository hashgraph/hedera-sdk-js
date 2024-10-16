import {
    PrivateKey,
    FileContentsQuery,
    Hbar,
    FileCreateTransaction,
    FileDeleteTransaction,
    Client,
    AccountId,
    Logger,
    LogLevel,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

dotenv.config();

// Set default log level to 'silent' if SDK_LOG_LEVEL is not specified in .env
const SDK_LOG_LEVEL = process.env.SDK_LOG_LEVEL || "SILENT";

// Initialize Logger with the specified log level from the environment variable
const logger = new Logger(LogLevel._fromString(SDK_LOG_LEVEL));

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
        !process.env.OPERATOR_ID ||
        !process.env.OPERATOR_KEY ||
        !process.env.HEDERA_NETWORK
    ) {
        console.error(
            "Environment variables OPERATOR_ID, OPERATOR_KEY, and HEDERA_NETWORK are required.",
        );
        throw new Error("Missing required environment variables.");
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

    //  Create the client based on the HEDERA_NETWORK environment variable
    const client = Client.forName(process.env.HEDERA_NETWORK);

    client.setOperator(operatorId, operatorKey);

    // Attach your custom logger to the SDK client
    client.setLogger(logger);

    /**
     * Step 1: Submit the file create transaction
     */

    // Content to be stored in the file.
    const fileContents = Buffer.from("Hedera is great!", "utf-8");

    try {
        console.log("Creating new file...");

        // Create the transaction
        let transaction = new FileCreateTransaction()
            .setKeys([operatorKey.publicKey])
            .setContents(fileContents)
            .setMaxTransactionFee(new Hbar(2))
            .freezeWith(client);

        transaction = await transaction.sign(operatorKey);

        const response = await transaction.execute(client);

        const receipt = await response.getReceipt(client);

        // Get the file ID
        const newFileId = receipt.fileId;
        console.log(`Created new file with ID: ${newFileId.toString()}`);

        /**
         * Step 2: Get file contents and print them
         */

        const fileContentsQuery = await new FileContentsQuery()
            .setFileId(newFileId)
            .execute(client);

        console.log("File contents: " + fileContentsQuery.toString());

        // Clean up: Delete created file
        const fileDeleteTxResponse = await new FileDeleteTransaction()
            .setFileId(newFileId)
            .execute(client);

        await fileDeleteTxResponse.getReceipt(client);

        console.log("File deleted successfully");
    } catch (error) {
        console.error("Error occurred during file creation:", error);
    } finally {
        client.close();
        console.log("Get File Contents Example Complete!");
    }
}

void main();
