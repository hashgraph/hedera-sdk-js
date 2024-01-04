import {
    AccountId,
    TransferTransaction,
    Hbar,
    Client,
    PrivateKey,
    Logger,
    LogLevel,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

/**
 * Serialize and deserialize the transaction after being freezed and signed
*/

async function main() {
    // Ensure required environment variables are available
    dotenv.config();
    if (!process.env.OPERATOR_KEY ||
        !process.env.OPERATOR_ID ||
        !process.env.ALICE_KEY ||
        !process.env.ALICE_ID ||
        !process.env.HEDERA_NETWORK
    ) {
        throw new Error("Please set required keys in .env file.");
    }
    // Create logger with info level of logging to the `Client`
    let infoLogger = new Logger(LogLevel.Info);

    const network = process.env.HEDERA_NETWORK

    // Configure client using environment variables
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
    const aliceId = AccountId.fromString(process.env.ALICE_ID);
    const aliceKey = PrivateKey.fromString(process.env.ALICE_KEY);

    const client = Client.forName(network).setOperator(operatorId, operatorKey)

    // Set logger
    client.setLogger(infoLogger);

    try {
        // 1. Create transaction and freeze it
        let transaction = new TransferTransaction()
            .addHbarTransfer(operatorId, new Hbar(-1))
            .addHbarTransfer(aliceId, new Hbar(1))
            .freezeWith(client)

        // 2. Sign transaction
        await transaction.sign(aliceKey);

        // 3. Serialize transaction into bytes
        const transactionBytes = transaction.toBytes();

        // 4. Deserialize transaction from bytes
        const transactionFromBytes = TransferTransaction.fromBytes(transactionBytes)

        // 5. Compare before and after serialization/deserialization
        let arr = []
        Object.keys(transaction).map((field) => {
            arr.push({
                field,
                before: transaction[field],
                after: transactionFromBytes[field]
            })
        })
        console.table(arr);

        // 6. Execute transaction
        await transaction.execute(client);
    } catch (error) {
        console.log(error);
    }

    client.close();
}

main();