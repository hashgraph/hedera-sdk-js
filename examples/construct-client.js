require("dotenv").config();

const {
    Client,
    NetworkName,
    AccountId
} = require("@hashgraph/sdk");

async function main() {
    let previewClient;
    let testClient;
    let mainClient;
    let namedNetworkClient;
    let customClient;
    let customNetwork;
    let configClient;
    let CONFIG_FILE = process.env.CONFIG_FILE;
    
   /*
    * Here are some ways you can construct and configure a client.
    * A client has a network and an operator.
    *
    * A Hedera network is made up of nodes -- individual servers who participate
    * in the process of reaching consensus on the order and validity of transactions
    * on the network.  Three networks you likely know of are previewnet, testnet, and mainnet.
    *
    * For the purpose of connecting to it, each node has an IP address or URL and a port number.
    * Each node also has an AccountId used to refer to that node for several purposes,
    * including the paying of fees to that node when a client submits requests to it.
    *
    * You can configure what network you want a client to use -- in other words, you can specify
    * a list of URLS and port numbers with associated AccountIds, and
    * when that client is used to execute queries and transactions, the client will
    * submit requests only to nodes in that list.
    *
    * A Client has an operator, which has an AccountId and a PublicKey, and which can
    * sign requests.  A client's operator can also be configured.
    */

    // Here's the simplest way to construct a client:
    previewClient = Client.forPreviewnet();
    testClient = Client.forTestnet();
    mainClient = Client.forMainnet();

    //or create client from environment variables 
    client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
        AccountId.fromString(process.env.OPERATOR_ID),
        PrivateKey.fromString(process.env.OPERATOR_KEY)
    );

    // These clients' networks are filled with default lists of nodes that are baked into the SDK.
    // Their operators are not yet set, and trying to use them now will result in exceptions.

    // We can also construct a client for previewnet, testnet, or mainnet depending on the value of a
    // network name string.  If, for example, the input string equals "testnet", this client will be
    // configured to connect to testnet.
    namedNetworkClient = Client.forName("testnet");

    // Let's set the operator on testClient.
    // (The AccountId and PrivateKey here are fake, this is just an example.)
    testClient.setOperator(
        AccountId.fromString("0.0.3"),
        PrivateKey.fromString("302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10")
    );

    // Let's create a client with a custom network.
    customNetwork = new HashMap();
    customNetwork.put("2.testnet.hedera.com:50211", new AccountId(5));
    customNetwork.put("3.testnet.hedera.com:50211", new AccountId(6));
    customClient = Client.forNetwork(customNetwork);

    // Since our customClient's network is in this case a subset of testnet, we should set the
    // network's name to testnet. If we don't do this, checksum validation won't work.
    // See ValidateChecksumExample.java.  You can use customClient.getNetworkName()
    // to check the network name.  If not set, it will return null.
    // If you attempt to validate a checksum against a client whose networkName is not set,
    // an IllegalStateException will be thrown.
    customClient.setNetworkName(NetworkName.Testnet);

    // Let's generate a client from a config.json file.
    // A config file may specify a network by name, or it may provide a custom network
    // in the form of a list of nodes.
    // The config file should specify the operator, so you can use a client constructed
    // using fromConfigFile() immediately.
    if (CONFIG_FILE != null) {
        configClient = Client.fromConfigFile(CONFIG_FILE);
        configClient.close();
    }

    // Always close a client when you're done with it
    previewClient.close();
    testClient.close();
    mainClient.close();
    namedNetworkClient.close();
    customClient.close();
}