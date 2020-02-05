# Get file info

`FileInfoQuery()` returns all the information related to the file. If a file has expired, there will be no information to retrieve.

| Constructor | Description |
| :--- | :--- |
| `FileInfoQuery()` | Initializes the FileInfoQuery object |

```java
new FileInfoQuery()
```

## Basic

| Method | Type | Description |
| :--- | :--- | :--- |
| `setFileId(<fileId>)` | FileId | The `fileId` of the file to return information for |

### Example

```java
const { Client, FileCreateTransaction, Ed25519PrivateKey, Hbar, FileInfoQuery } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
  
  const operatorAccount = process.env.OPERATOR_ID;
  const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
  const operatorPublicKey = operatorPrivateKey.publicKey;

  if (operatorPrivateKey == null || operatorAccount == null) {
    throw new Error(
      "environment variables OPERATOR_KEY and OPERATOR_ID must be present"
    );
  }

  const client = Client.forTestnet()
  client.setOperator(operatorAccount, operatorPrivateKey);

  const transactionId = await new FileCreateTransaction()
    .setContents("Hello, Hedera's file service!")
    .addKey(operatorPublicKey) // Defines the "admin" of this file
    .setMaxTransactionFee(new Hbar(15))
    .execute(client);

  const receipt = await transactionId.getReceipt(client);  
  console.log("new file id = ", receipt.getFileId());

  const fileInfo = await new FileInfoQuery()
    .setFileId(receipt.getFileId())
    .execute(client);

  console.log(fileInfo.size);
}

main();
```

