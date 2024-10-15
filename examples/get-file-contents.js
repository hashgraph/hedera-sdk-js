/* eslint-disable n/no-extraneous-import */
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

import pino from "pino";
import pinoPretty from "pino-pretty";

dotenv.config();

// Set default log level to 'silent' if SDK_LOG_LEVEL is not specified in .env
const SDK_LOG_LEVEL = process.env.SDK_LOG_LEVEL || "silent";

// Logger configuration based on SDK_LOG_LEVEL
const logger = pino(
    {
        level: SDK_LOG_LEVEL.toLowerCase(), 
    },
    pinoPretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
    }),
);

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

    //  Create the client based on the HEDERA_NETWORK environment variable
    let client = Client.forName(process.env.HEDERA_NETWORK);

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
