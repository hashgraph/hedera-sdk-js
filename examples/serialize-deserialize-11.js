import {
    AccountId,
    Wallet,
    PrivateKey,
    LocalProvider,
    Transaction,
    FileCreateTransaction,
    LogLevel,
    Logger,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

/**
 * @description Serialize and deserialize so-called incomplete transaction (chunked), set node account ids and execute it
 */

async function main() {
    // Ensure required environment variables are available
    dotenv.config();
    if (
        !process.env.OPERATOR_KEY ||
        !process.env.OPERATOR_ID ||
        !process.env.HEDERA_NETWORK
    ) {
        throw new Error("Please set required keys in .env file.");
    }

    // Configure client using environment variables
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_KEY);

    const provider = new LocalProvider();
    const infoLogger = new Logger(LogLevel.Info);
    provider.setLogger(infoLogger);
    const wallet = new Wallet(operatorId, operatorKey, provider);

    try {
        // 1. Create transaction
        const transaction = new FileCreateTransaction()
            .setKeys([wallet.getAccountKey()])
            .setContents("[e2e::FileCreateTransaction]");

        // 2. Serialize transaction into bytes
        const transactionBytes = transaction.toBytes();

        // 3. Deserialize transaction from bytes
        let transactionFromBytes = Transaction.fromBytes(transactionBytes);

        // 4. Set node accoutn ids
        transactionFromBytes.setNodeAccountIds([new AccountId(3)]);

        // 5. Freeze, sign and execute transaction
        const response = await (
            await (
                await transactionFromBytes.freezeWithSigner(wallet)
            ).signWithSigner(wallet)
        ).executeWithSigner(wallet);

        // 6. Get a receipt
        const receipt = await response.getReceiptWithSigner(wallet);
        console.log(`Transaction status: ${receipt.status.toString()}!`);
    } catch (error) {
        console.log(error);
    }

    provider.close();
}

void main();
