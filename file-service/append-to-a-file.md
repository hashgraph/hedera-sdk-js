# Append to a file

`FileAppendTransaction()` appends content to the end of an existing file.

| Constructor | Description |
| :--- | :--- |
| `FileAppendTransaction()` | Initializes the FileAppendTransaction object |

```java
new FileAppendTransaction()
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setFileId(<fileId>)` | FileId | The `fileId` of the file to append content to |
| `setContents(<content>)` | byte\[ \] | The appended content in byte format |

## Example

```java
const { Client, FileCreateTransaction, Ed25519PrivateKey, Hbar, FileAppendTransaction, FileContentsQuery, String } = require("@hashgraph/sdk");
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
const fileId = receipt.getFileId(); 
console.log("new file id = ", fileId);

const fileAppendTransactionId = await new FileAppendTransaction()
    .setFileId(receipt.getFileId())
    .setContents("The appended contents")
    .execute(client);

const appendReceipt = await fileAppendTransactionId.getReceipt(client);

console.log(appendReceipt)

}

main();
```

