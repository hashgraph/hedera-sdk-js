# Transfer cryptocurrency

`CryptoTransferTransaction()` transfers tinybars from one Hedera account to different Hedera account on the Hedera network. The amount is in **tinybars** \(not hbars\). The transaction must be signed by all the keys from all sender accounts. If the sender fails to have insufficient funds in their account to process the transaction, the transaction fails and the tinybars will not be transferred to the receiving account. The service fee will still be charged in the case of insufficient funds.

{% hint style="info" %}
There are `100_000_000` tinybars in one hbar.
{% endhint %}

| Constructor | Description |
| :--- | :--- |
| `CryptoTransferTransaction()` | Initializes the CryptoTransferTransaction object |

```java
new CryptoTransferTransaction()
```

| Methods | Type | Description |
| :--- | :--- | :--- |
| `addSender(<accountId>, <amount>)` | AccountId, number | The sender is the account ID of the account and the amount \(value\) of tinybars that will be withdrawn from that account. The amount being withdrawn from the sender has to equal the amount that will be deposited into the recipient account. This method can be called multple times. |
| `addRecipient(<accountId>, <amount>)` | AccountId, number | The recipient is account ID of the account the tinybars will be deposited into and the amount \(value\). The amount being withdrawn from the sender account has to equal the amount that will be deposited into the recipient account. |

## Example

```javascript
const { Client, CryptoTransferTransaction } = require("@hashgraph/sdk");

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

    const receipt = await (await new CryptoTransferTransaction()
        .addSender(operatorAccount, 1)
        .addRecipient("0.0.3", 1)
        .setTransactionMemo("sdk example")
        .execute(client))
        .getReceipt(client);

    console.log(receipt);
}

main();
```

