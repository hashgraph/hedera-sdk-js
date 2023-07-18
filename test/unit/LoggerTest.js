import { Logger, LogLevel, Transaction } from "../../src/exports.js";
import { Client } from "../../src/index.js";

describe("Logger", function () {
    this.timeout(50000);

    it("set and get log level correctly inside the `Client` object", async function () {
        const client = Client.forPreviewnet({
            scheduleNetworkUpdate: false,
        });

        //during initialization of the `Client`, there is no logger set
        expect(client.logger).to.be.null;
        
        //set logger with info level of logging to the `Client`
        let infoLogger = new Logger(LogLevel.Info);
        client.setLogger(infoLogger);
        
        //check if the log level is in fact `info`
        expect(client.logger.level).to.be.equal(LogLevel.Info);
        
        //change the level of the logger to `warn` and check
        //if it is the same when extracted from the `Client` 
        infoLogger.setLevel(LogLevel.Warn);
        expect(client.logger.level).to.be.equal(LogLevel.Warn);
        
        //silence the logger and check if it changed inside the `Client`
        infoLogger.setSilent(true);
        expect(client.logger.level).to.be.equal(LogLevel.Silent);
    });

    it("set and get log level correctly inside the `Transaction` object", async function () {
        const transaction = new Transaction();

        //during initialization of the `Transaction`, there is no logger set
        expect(transaction.logger).to.be.null;
        
        //set logger with info level of logging to the `Transaction`
        let infoLogger = new Logger(LogLevel.Info);
        transaction.setLogger(infoLogger);
        
        //check if the log level is in fact `info`
        expect(transaction.logger.level).to.be.equal(LogLevel.Info);
        
        //change the level of the logger to `warn` and check
        //if it is the same when extracted from the `Transaction` 
        infoLogger.setLevel(LogLevel.Warn);
        expect(transaction.logger.level).to.be.equal(LogLevel.Warn);
        
        //silence the logger and check if it changed inside the `Transaction`
        infoLogger.setSilent(true);
        expect(transaction.logger.level).to.be.equal(LogLevel.Silent);
    });

    it("check the possible log levels on the logger", async function () {
        const transaction = new Transaction();
        //during initialization of the `Transaction`, there is no logger set
        expect(transaction.logger).to.be.null;
        
        //set logger with info level of logging to the `Transaction`
        const infoLogger = new Logger(LogLevel.Info);
        const levels = Object.values(infoLogger.levels);

        expect(levels).to.include("trace");
        expect(levels).to.include("debug");
        expect(levels).to.include("info");
        expect(levels).to.include("warn");
        expect(levels).to.include("error");
        expect(levels).to.include("fatal");
    });
});
