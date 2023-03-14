import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    TransferTransaction,
} from "@hashgraph/sdk";

async function main() {
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = AccountId.fromString("0.0.1420842");
    const newAccountId = AccountId.fromString("0.0.1444354-jwgyz");
    const myPrivateKey = PrivateKey.fromString(
        "302e020100300506032b6570042204203981726b8bda6cd74bad38c1dd14c13fb94b42476477f85ba7987e2075f860ab"
    );

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    console.log(new Date().toLocaleTimeString());

    // Create Client
    const client = Client.forMainnet();
    client.setOperator(myAccountId, myPrivateKey);
    client.setNetworkUpdatePeriod(10000);

    let myHandler = function (messages, context) {
        console.log("LOGS", { message: messages[0], level: context.level }); // can be used for posting/sending/writing logs
    };

    const level = {
        value: 3,
        name: "INFO",
    };

    client.setLogger(myHandler, level);

    // client.setLoggerType("Transaction");

    // Put the transaction logger on the client
    // setLogger and pass the logger implementation
    // setLogger has to use the interface from the logger implementation
    // user can pass in any logger interface
    // set vs enable logger: (set is for setting your own and enable means start to use the internal)

    // set logger and get logger on the client and define interface
    // maye we want set and get logger on the transactions
    // POC for the next meeting

    //Use Global Logger
    // Logger js / Log js

    for (let i = 0; i < 1; i++) {
        try {
            // Send HBARs
            const transferHbar = await new TransferTransaction()
                .setNodeAccountIds([new AccountId(10)])
                .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1))
                .addHbarTransfer(newAccountId, Hbar.fromTinybars(1))
                .execute(client);

            //Verify the transaction reached consensus
            const transferReceipt = await transferHbar.getReceipt(client);
            console.log(`ITERATION ${i} is`, transferReceipt.status.toString());

            // Send HBARs
            const transferHbar2 = await new TransferTransaction()
                .setNodeAccountIds([new AccountId(10)])
                .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1))
                .addHbarTransfer(newAccountId, Hbar.fromTinybars(1))
                .execute(client);

            //Verify the transaction reached consensus
            const transferReceipt2 = await transferHbar2.getReceipt(client);
            console.log(
                `ITERATION ${i}2 is`,
                transferReceipt2.status.toString()
            );

            // // //Verify the transaction reached consensus
            // // const transferReceipt = await transferHbar.getReceipt(client);
            // // console.log(
            // //   `The transfer receipt for iteration ${i} is`,
            // //   transferReceipt.status.toString()
            // // );

            // // Get balance of Account 1
            // const accountBalance = await new AccountBalanceQuery()
            //   .setAccountId("0.0.1420842")
            //   .setMaxAttempts(10)
            //   .execute(client);
            // console.log("First Account Balance:", accountBalance.hbars.toString());

            // // Get balance of Account 2
            // const accountBalance2 = await new AccountBalanceQuery()
            //   .setAccountId("0.0.1444354")
            //   .setMaxAttempts(10)
            //   .execute(client);
            // console.log(
            //   "Second Account Balance:",
            //   accountBalance2.hbars.toString()
            // );
        } catch (e) {
            console.log(new Date().toLocaleTimeString());
            console.log(e);
        }
        await timer(500);
    }
}
void main();
