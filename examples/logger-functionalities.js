import {
    Wallet,
    Client,
    LocalProvider,
    PrivateKey,
    Hbar,
    HbarUnit,
    AccountId,
    TransferTransaction,
    TopicCreateTransaction,
    Logger,
    LogLevel,
    LogFormat,
} from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();

/**
 * Main concept notes!
 *
 * If the logger on the request is not set, the logger in client will be applied
 * If the client does not have a previously set logger, there will be no logs
 * (Setting a logger to a transaction will have priority over the logger in the client)
 *
 *
 * If you change/enhance property or functionality of a given logger,
 * this will be applied in every other usage of the same logger
 *
 * A suggestion is to use different logger instance in the client
 * and in each different transactions
 */

async function main() {
    if (process.env.OPERATOR_ID == null || process.env.OPERATOR_KEY == null) {
        throw new Error(
            "Environment variables OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

    let debugLogger = new Logger(LogLevel.Debug)
        // Whether or not to include lower levels than the specified level
        // when logging to a file and if the user provides a specific `level` to `saveToFile()`,
        .setIncludeLowerLevelsInFileLogs(true);

    let infoLogger = new Logger(LogLevel.Info);

    const client = Client.forPreviewnet()
        // Set the client's logger to `debugLogger` with debug mode
        .setLogger(debugLogger)
        .setOperator(operatorId, operatorKey);

    const wallet = new Wallet(operatorId, operatorKey, new LocalProvider());

    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;
    const aliasAccountId = publicKey.toAccountId(0, 0);

    // This will log every `debug` and lower level message to a newly
    // created `log.txt` file in the current directory in string format
    debugLogger.saveToFile("debugLogger.txt", LogLevel.Debug, LogFormat.String);

    // This will log only `info` level messages to a newly
    // created `info.txt` file in the current directory in string format
    // This is because the default value of `_includeLowerLevelsInFileLogs` flag is `false`
    infoLogger.saveToFile("infoLogger.txt", LogLevel.Info, LogFormat.String);

    let transferTransaction = new TransferTransaction()
        .addHbarTransfer(wallet.accountId, Hbar.from(-10, HbarUnit.Hbar))
        .addHbarTransfer(aliasAccountId, Hbar.from(10, HbarUnit.Hbar))
        .setTransactionMemo("");

    await transferTransaction.execute(client);

    let topicTransaction = new TopicCreateTransaction()
        .setLogger(infoLogger)
        .setTopicMemo("topic memo");

    await topicTransaction.execute(client);

    let infoLogger2 = new Logger(LogLevel.Info);
    // Change the `infoLogger2` level from `info` to `debug`
    infoLogger2.setLevel(LogLevel.Debug);

    let topicTransaction2 = new TopicCreateTransaction()
        .setLogger(infoLogger2) // now with `debug` mode
        .setTopicMemo("topic memo");

    // This will log only `debug` level messages to a newly
    // created `info.txt` file in the current directory in json format
    // This is because the default value of `_includeLowerLevelsInFileLogs` flag is `false`
    infoLogger2.saveToFile("infoLogger2.txt", LogLevel.Debug, LogFormat.Json);

    await topicTransaction2.execute(client);

    let debugLogger2 = new Logger(LogLevel.Debug)
        .saveToFile("debugLogger2.txt", LogLevel.Debug, LogFormat.Json)
        // If you set `silent` to `true`, the logger will be muted and there will be no logs
        .setSilent(true);

    let topicTransaction3 = new TopicCreateTransaction()
        .setLogger(debugLogger2)
        .setTopicMemo("topic memo");

    await topicTransaction3.execute(client);
}

void main();
