# Create a file

`FileCreateTransaction()` creates a new file. The file is referenced by its file ID which can be obtained from the receipt or record of the transaction. The file does not have a file name. If the file is too big to create with a single `FileCreateTransaction()`, the file can be appended with the remaining content multiple times using the `FileAppendTransaction()` constructor.

| Constructor | Description |
| :--- | :--- |
| `FileCreateTransaction` | Initializes the FileCreateTransaction object |

```java
new FileCreateTransaction()
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `addKey(<key>)` | [Ed25519PublicKey](https://github.com/hashgraph/hedera-sdk-java/blob/master/src/main/java/com/hedera/hashgraph/sdk/crypto/ed25519/Ed25519PublicKey.java) | The public key of the owner of the file |
| `setContents(<contents>)` | bytes\[\] | The file contents |
| `setExpirationTime(<expiration)` | Instant | The time at which this file should expire \(unless FileUpdateTransaction is used before then to extend its life\) |

## Example

```java
const operatorAccount = process.env.OPERATOR_ID;
const operatorPrivateKey = process.env.OPERATOR_KEY;
const operatorPublicKey = Ed25519PublicKey.fromString(process.env.OPERATOR_PUB_KEY);

if (operatorPrivateKey == null || operatorAccount == null) {
  throw new Error(
    "environment variables OPERATOR_KEY and OPERATOR_ID must be present"
  );
}

const client = new Client({
 network: { "0.testnet.hedera.com:50211": "0.0.3" },
 operator: {
   account: operatorAccount,
   privateKey: operatorPrivateKey
 }
});

const transactionId = await new FileCreateTransaction()
 .setContents("Hello, Hedera's file service!")
 .addKey(operatorPublicKey) // Defines the "admin" of this file
 .setMaxTransactionFee(Hbar.of(1000))
 .execute(client);

const receipt = await transactionId.getReceipt(client);  
console.log("new file id = ", receipt._fileId);
```

