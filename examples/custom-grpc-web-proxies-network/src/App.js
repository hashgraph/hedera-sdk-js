import { useEffect } from "react";

import {
    AccountId,
    PrivateKey,
    Client,
    Hbar,
    TransferTransaction,
    Logger,
    LogLevel,
} from "@hashgraph/sdk";

function App() {
    const transferTransaction = async () => {
        /**
         * 1. Setup operatorId and operatorKey
         */
        const operatorId = AccountId.fromString("0.0.1458");
        const operatorKey = PrivateKey.fromStringECDSA(
            "3030020100300706052b8104000a042204208c4ffe487636e8102f72502a2ed16cb4f98073582a777fcfa758481485d9f887",
        );

        /**
         * 2. Create a custom network with GRPC web proxies
         */
        const nodes = {
            "https://testnet-node02-00-grpc.hedera.com:443": new AccountId(5),
            "https://testnet-node03-00-grpc.hedera.com:443": new AccountId(6),
            "https://testnet-node04-00-grpc.hedera.com:443": new AccountId(7),
        };

        /**
         * 3. Setup the client using "Client"
         */
        const client = Client.forNetwork(nodes);

        client.setOperator(operatorId, operatorKey);
        const debugLogger = new Logger(LogLevel.Debug);
        client.setLogger(debugLogger);

        const newAccountId = new AccountId(2672318);

        /**
         * 4. Execute transfer transaction
         */
        await new TransferTransaction()
            .addHbarTransfer(operatorId, Hbar.fromTinybars(-1)) // Sending account
            .addHbarTransfer(newAccountId, Hbar.fromTinybars(1)) //Receiving account
            .execute(client);
    };

    useEffect(() => {
        // triggers the transaction when the page is loaded
        transferTransaction();
    }, []);

    return (
        <div className="App">
            <h1>Custom gRPC web proxies network example</h1>
            <p>Check the console for the transaction details.</p>
        </div>
    );
}

export default App;
