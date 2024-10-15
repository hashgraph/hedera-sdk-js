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

// Removed pino logger initialization
const logger = console;

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
        logger.error(
            "Environment variables OPERATOR_ID, OPERATOR_KEY, and HEDERA_NETWORK are required.",
        );
        throw new Error("Missing required environment variables.");
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

    let client;

    // Adjust this as needed for your local network
    const localNetworkConfig = {
        "127.0.0.1:50211": new AccountId(3),
    };

    switch (process.env.HEDERA_NETWORK) {
        case "mainnet":
            client = Client.forMainnet();
            break;
        case "testnet":
            client = Client.forTestnet();
            break;
        case "previewnet":
            client = Client.forPreviewnet();
            break;
        case "local-node":
            client = Client.forNetwork(localNetworkConfig);
            break;
        default:
            logger.error("Unsupported HEDERA_NETWORK value.");
            throw new Error(
                "Unsupported HEDERA_NETWORK value. Set to 'mainnet', 'testnet', 'previewnet', or 'local-node'.",
            );
    }
    client.setOperator(operatorId, operatorKey);

    /**
     * Step 1: Submit the file create transaction
     */

    // Content to be stored in the file.
    const fileContents = Buffer.from("Hedera is great!", "utf-8");

    try {
        logger.info("Creating new file...");

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
        logger.info(`Created new file with ID: ${newFileId.toString()}`);

        /**
         * Step 2: Get file contents and print them
         */

        const fileContentsQuery = await new FileContentsQuery()
            .setFileId(newFileId)
            .execute(client);

        logger.info("File contents: " + fileContentsQuery.toString());

        // Clean up: Delete created file
        const fileDeleteTxResponse = await new FileDeleteTransaction()
            .setFileId(newFileId)
            .execute(client);

        await fileDeleteTxResponse.getReceipt(client);

        logger.info("File deleted successfully");
    } catch (error) {
        logger.error("Error occurred during file creation:", error);
    } finally {
        client.close();
        logger.info("Get File Contents Example Complete!");
    }
}

void main();
