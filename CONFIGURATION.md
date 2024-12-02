# Configuration

The packages of the JS SDK support loading of configuration from an .env file or via the environment.

## Environment Variables

### Required

|------|-------|---------|
| OPERATOR_ID | Account ID of the operator account used to pay for transactions and queries | 0.0.12345 |
| OPERATOR_KEY | Private key of the operator account | 302e020100300506032b657004220420db484b828e64b2d8f12ce3c0a0e93a0b8cce7af1bb8f39c97732394482538e10 |
| HEDERA_NETWORK | Network to connect to: mainnet, testnet, previewnet, or localhost | testnet |

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
