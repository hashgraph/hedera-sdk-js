import {
    Client,
    AccountId,
    AccountBalanceQuery,
    PrivateKey,
    Hbar,
    TransferTransaction,
    Transaction,
    TransactionReceiptQuery,
    AccountInfoQuery,
} from "@hashgraph/sdk";

async function main() {
    // //Grab your Hedera testnet account ID and private key from your .env file
    // const myAccountId = AccountId.fromString("0.0.1420842");
    // const newAccountId = AccountId.fromString("0.0.1444354-jwgyz");
    // const myPrivateKey = PrivateKey.fromString(
    //     "302e020100300506032b6570042204203981726b8bda6cd74bad38c1dd14c13fb94b42476477f85ba7987e2075f860ab"
    // );

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = AccountId.fromString("0.0.8920");
    const newAccountId = AccountId.fromString("0.0.8918");
    const myPrivateKey = PrivateKey.fromString(
        "3030020100300706052b8104000a0422042007f9f9c355d32c5c93a50024b596ed3ccc39954ba1963c68ac21cb7802fd5f83"
    );

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    console.log("Start");
    console.log(new Date().toLocaleTimeString());

    // Create Client
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    for (let i = 0; i < 1000; i++) {
        try {
            // Send HBARs
            const transferHbar = await new TransferTransaction()
                .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1))
                .addHbarTransfer(newAccountId, Hbar.fromTinybars(1))
                .execute(client);

            //Verify the transaction reached consensus
            const transferReceipt = await transferHbar.getReceipt(client);
            console.log(
                `The transfer receipt for iteration ${i} is`,
                transferReceipt.status.toString()
            );

            // Get balance of Account 1
            const accountInfoQuery = await new AccountInfoQuery()
                .setAccountId("0.0.8918")
                .execute(client);
            console.log(
                "First Account accountInfoQuery accountID:",
                accountInfoQuery.accountId.toString()
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
