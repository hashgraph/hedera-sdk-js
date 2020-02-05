# Get file contents

`FileContentsQuery()` returns the contents of a file. If the file is empty the content field is empty. The response returns the file ID and the file contents in bytes.

| Constructor | Description |
| :--- | :--- |
| `FileContentsQuery()` | Initializes a FileContentQuery object |

```javascript
new FileContentsQuery()
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAccountId(<account>)` | AccountID | The ID of the file to get contents from |

## Example

```javascript
const { Client, FileContentsQuery, FileId } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet()
    client.setOperator(operatorAccount, operatorPrivateKey);

    const resp = await new FileContentsQuery()
        .setFileId(FileId.ADDRESS_BOOK)
        .execute(client);

    console.log(resp)
}

main();
```

