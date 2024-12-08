# Introduction

The packages of the JS SDK support loading of configuration from an .env file or via the environment.

# Table of contents

1. Introduction ..................................................
2. Configuration Options .........................................
   2.1 Network Configuration .....................................
   2.2 Operator Settings ..........................................
   2.3 Transaction Settings .......................................
3. Error Handling ................................................
4. Examples ......................................................
5. Conclusion ....................................................

## Environment Variables

### Required

| Name           | Value                                                                       | Example                                                                                          |
| -------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| OPERATOR_ID    | Account ID of the operator account used to pay for transactions and queries | 302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10 |
| OPERATOR_KEY   | ED25519 private key of the operator account                                 | 0.0.12345                                                                                        |
| HEDERA_NETWORK | Network to connect to: mainnet, testnet, previewnet, or localhost           | localhost                                                                                        |

## ED25519 or ECDSA key

### Integration tests

When you run integration tests you should use an Ed25519 private key. This is set up [here](test/integration/BaseIntegrationTestEnv.js:95). If you have an ECDSA key you should change the line to:

```javascript
const operatorKey = PrivateKey.fromStringECDSA(options.env.OPERATOR_KEY);
```

### Examples

The examples use both ED25519 and ECDSA keys. These examples come with a pre-filled .env file, so you generally don’t need to make changes. However, if you modify the .env file, ensure the correct type of private key is used.

To verify which type of key is required, check the example code for the initialization method in the client/wallet. Look for either `fromStringED25519` or `fromStringECDSA`.

_Note that some examples are designed to work only with ECDSA private keys._

#### `fromStringDer`

This example uses `fromString`, which internally calls `fromStringED25519`.

#### Optional Parameters

Certain examples simulate different actors in the network, such as Alice, Bob, or Treasury. These examples require additional environment variables, which are pre-configured in the .env file. Examples of such variables include:

-   `ALICE_KEY`
-   `BOB_KEY`
-   `TREASURY_KEY`
-   `ALICE_ID`
-   `BOB_ID`
-   `TREASURY_ID`

### React Native Example

This example uses `fromString`, which internally calls `fromStringED25519`.

### Simple REST Signature Provider

This behaves the same as the React Native example.

## Which network to use?

-   The maintainers of this repository use `hedera-local-node` when running integration tests. Running integration tests on testnet costs far too much HBARs.
-   When running examples you can use any network you want. The examples are used for us to demonstrate to the community how a features is supposed to work so they optimized to work on any network you want.
-   Unit tests do not require environment variables.

## How to get my account keys and IDs?

### Local network

If you have followed our best practices, such as using hedera-local-node for running integration tests, you can retrieve account keys and IDs when starting the local node. Upon startup, the local node generates accounts and displays their details.

You can copy one of these accounts and use its key and ID for the following:

-   `OPERATOR_KEY` and `OPERATOR_ID`
-   `ALICE_ID` and `ALICE_KEY`
-   `BOB_ID` and `BOB_KEY`
-   `TREASURY_ID` and `TREASURY_KEY`

### Testnet and previewnet

To run the examples on the testnet, you can obtain your account keys and IDs from the Hedera Portal Dashboard.

## Possible configuration issues

-   Most common problem is that users use ED25519 key when the code asks for ECDSA key or vice versa. Please double check if you sue the correct key.
-   You might have ran the unit tests while running local-node. This will break multiple tests.
-   Doesn't happen often but on rare ocassions some of the tests will break but rerunning them will give the expected result.
-   If you hadn't used `local-node` for a long time sometimes it goes in sleep mode and you need to restart it to rerun the tests. This is not an issue with the SDK itself but still a very common problem.
-   Please use the command `task install` and do not install the packages manually using `npm` or `yarn`. This might create some configuration issues.

## Should I have multiple .env files like .env.local, .env.production, .envdevelopment etc?

[Owner of dotenv says - no.](https://github.com/motdotla/dotenv#should-i-have-multiple-env-files)

## Client Configuration

### Network Configuration

-   `setNetwork` - The setNetwork method configures the network nodes that your client will communicate with on the Hedera network. It's a fundamental configuration step that determines which nodes will process your transactions and queries.

Example:

```javascript
const client = Client.forNetwork();
client.setNetwork({
    "2.testnet.hedera.com:50211": new AccountId(0, 0, 5),
});
```

-   `setMirrorNetwork` - Configure the mirror nodes

```javascript
const client = Client.forNetwork();
client.setMirrorNode(["https://testnet.mirrornode.hedera.com"]);
```

-   `setNetworkFromAddressBook` - Set network using address book response from the AddressBookQuery execution.

```javascript
const result = await new AddressBookQuery()
    .setFileId(FileId.ADDRESS_BOOK)
    .execute(client);

client = client.setNetworkFromAddressBook(result);
```

-   `setLedgerId` - Set the network ledger ID (mainnet/testnet/previewnet)

```javascript
let client = Client.forNetwork().setLedgerId(LedgerId.PREVIEWNET);
```

or

```javascript
let client = Client.forNetwork().setLedgerId("previewnet");
```

-   `setTransportSecurity` - The `setTransportSecurity` method in the Hedera JavaScript SDK is used to enable or disable transport security for the communication between the SDK and the Hedera network nodes. Transport security refers to the mechanisms used to secure the communication channel, typically involving encryption and authentication protocols.
    When transport security is enabled, the SDK will establish a secure connection with the Hedera network nodes using protocols like Transport Layer Security (TLS) or its predecessor, Secure Sockets Layer (SSL). This ensures that the data transmitted between the SDK and the nodes is encrypted, protecting it from eavesdropping and tampering. It also provides authentication mechanisms to verify the identity of the nodes and prevent man-in-the-middle attacks.

```javascript
const client = Client.forNetwork();
client.setTransportSecurity(true);
```

### Operator Settings

-   `setOperator` - Set the operator account and private key. The operator is the account that will pay for the transactions the user executes.

```javascript
const operatorId = AccountId.fromString("...");
const operatorKey = PrivateKey.generateED25519();
let client = Client.forNetwork().setOperator(operatorId, operatorKey);
```

-   `setOperatorWith` - Set the operator id and key and also provide a custom transaction signer function instead of using the default one.

```javascript
tx.setOperatorWith(accountId, key.publicKey, (message) =>
    Promise.resolve(key.sign(message)),
);
```

### Transaction Settings

-   `setDefaultMaxTransactionFee` - Set maximum transaction fee user is willing to pay.

```javascript
const client = Client.forTestnet({
    scheduleNetworkUpdate: false,
}).setDefaultMaxTransactionFee(Hbar.fromTinybars(1));
```

-   `setDefaultRegenerateTransactionId` - Configure transaction ID regeneration. This function accepts a boolean type of value. When set to true it will regenerate the transaction ID when a `TRANSACTION_EXPIRED` status is returned.

-   `setSignOnDemand` - Configure on-demand transaction signing

The setSignOnDemand method in the Hedera JavaScript SDK allows you to configure how transactions are signed before being submitted to the Hedera network. By default, transactions are signed immediately after being constructed. However, in some cases, you may want to delay the signing process until just before the transaction is submitted. This can be useful in scenarios where you need to perform additional operations or validations on the transaction before signing it.

When you call client.setSignOnDemand(true), it instructs the SDK to defer the signing of transactions until the transaction.sign() method is explicitly called. This means that when you create a transaction using the SDK, it will not be signed automatically. Instead, you will need to call transaction.sign() manually before submitting the transaction to the network.

### Query Settings

-   `setDefaultMaxQueryPayment` - Same as `setDefaultMaxTransactionFee` but for queries.

### Retry and Timeout Settings

-   `setMaxAttempts` - Sets maximum retry attempts before an error is thrown.
-   `setMaxNodeAttempts` - Set maximum node retry attempts
-   `setMinBackoff` - Set minimum backoff time for retries.
    There's a time the SDK waits for after every failed attempt. A lower minBackoff value will result in more frequent retries initially, which can be useful for faster recovery from transient failures. This time increases exponentially. The default values provided by the SDK are generally reasonable for most use cases, but you may want to adjust them based on your specific requirements.
-   `setMaxBackoff` - Set maximum backoff time for retries
    Same as above but this sets on the maximum amount of seconds the backoff time may go.
-   `setRequestTimeout` - This timeout is the maximum allowed time for the entire transaction/query, including all retries.
-   `setMaxExecutionTime` - this timeout applies to each single gRPC request within the transaction/query. It’s used for the edge cases where 10 seconds are not enough for the execution of a single gRPC request and the user can pass more.

```javascript
const client = Client.forNetwork();
client.setRequestTimeout(10000); // Set the request timeout to 10 seconds (10000 milliseconds)
```

### Node Management

-   `setMaxNodesPerTransaction` - Set maximum nodes per transaction
    This sets the maximum amount of nodes that the transaction will try to execute to.Setting a higher value for setMaxNodesPerTransaction can improve the reliability of transaction execution, but it also increases the network load and the overall cost of the transaction (since you'll be paying transaction fees for each node that executes the transaction).
-   `setNodeMinBackoff` - The `setNodeMinBackoff` method is SDK is used to set the minimum backoff time (in milliseconds) for retrying operations on a specific node.
    When you send a request to a node in the Hedera network, and the node fails to respond or encounters an error, the SDK will attempt to retry the request on the same node after a certain amount of time. This time is known as the backoff time, and it starts at a minimum value (set by setNodeMinBackoff) and increases exponentially with each subsequent retry attempt, up to a maximum value (set by setNodeMaxBackoff).
    The backoff mechanism is designed to prevent overwhelming the nodes with too many retries in a short period of time, while still allowing the SDK to recover from transient failures or network issues.
    Here's an example of how you can set the minimum node backoff time using the setNodeMinBackoff method:

```javascript
const client = Client.forNetwork();
client.setNodeMinBackoff(500); // Set minimum node backoff to 500 milliseconds (0.5 seconds)
```

-   `setNodeMaxBackoff` - It sets the maximum seconds allowed for the node backoff explained in the previous setting.

-   `setNodeMinReadmitPeriod` - Set minimum node readmit period
    When a node fails to respond or encounters an error while processing a request, the SDK will temporarily remove that node from the pool of available nodes. This is done to prevent the SDK from repeatedly sending requests to a node that is experiencing issues, which could further exacerbate the problem.
    The `setNodeMinReadmitPeriod` method allows you to configure the minimum amount of time that a node must wait before it can be readmitted to the pool of available nodes. During this period, the SDK will not send any requests to that node, giving it time to recover or resolve any issues it may be experiencing.

-   `setNodeMaxReadmitPeriod` - Set maximum node readmit period.
    The setNodeMaxReadmitPeriod method allows you to configure the maximum amount of time that a node can be excluded from the pool of available nodes. After this period has elapsed, the SDK will automatically readmit the node to the pool, regardless of whether it has recovered or not.

-   `setNodeWaitTime` - The `setNodeWaitTime` method in the Hedera JavaScript SDK is used to set the minimum amount of time (in milliseconds) that the SDK will wait before attempting to send a request to a node that has recently failed or encountered an error.

```javascript
const client = Client.forNetwork();
client.setNodeWaitTime(5000); // Set node wait time to 5 seconds (5000 milliseconds)
```

### Network Update Settings

-   `setNetworkUpdatePeriod` - The setNetworkUpdatePeriod method in the Hedera JavaScript SDK is used to configure the frequency at which the SDK updates its internal representation of the Hedera network topology.
    The Hedera network is a distributed ledger system that consists of multiple nodes spread across different geographic locations. These nodes can join or leave the network at any time, and their availability and performance can vary depending on various factors such as network conditions, hardware issues, or software updates.
    To ensure that the SDK has an up-to-date view of the network topology, it periodically retrieves information about the available nodes and their respective performance metrics. This information is used to determine which nodes to send requests to and to adjust the load balancing and failover strategies accordingly.
-   `setAutoValidateChecksums` - Configure automatic checksum validation

### Logging

-   `setLogger` - Configure client logger. Setting a logger can give you additional information for debugging processes. This is an example of how you can use this fucntionality.

```javascript
const infoLogger = new Logger(LogLevel.Info);
client.setLogger(infoLogger);
```

There are different LogLevels: `LogLevel.Info`, ``LogLevel.Silent`, `LogLeve.Trace`, `LogLevel.Debug`, `LogLevel.Warn`, `LogLevel.Error`, `LogLevel.Fatal`.
