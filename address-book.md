# Address Book

The address book contains the node ID and and node address information required to sync with Hedera node\(s\) in a specific network.  The **mainnet** address book file ID is `0.0.102`. You can obtain the address book information by requesting the contents of the file `0.0.102` \([`FileContentsQuery()`]()\). The network information can also be found in your Hedera portal account.

The **testnet** address book information is available in the Hedera portal. 

### Example:

Get testnet address book

```javascript
const { Client, FileContentsQuery, FileId } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = new Client({
        network: { "0.testnet.hedera.com:50211": "0.0.3" },
        operator: {
            account: operatorAccount,
            privateKey: operatorPrivateKey
        }
    });

    const resp = await new FileContentsQuery()
        .setFileId(FileId.ADDRESS_BOOK)
        .execute(client);

    console.log(resp.contents);
}

main();
```

