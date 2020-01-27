# Get account balance

| Method | Type | Description |
| :--- | :--- | :--- |
| `getAccountBalance(<accountId>)` | AccountId | Get the balance of an account of the client object |

### Example

```javascript
// Returns the account balance of th operator account 
console.log('current account balance:', await client.getAccountBalance());
```

## Advanced

`AccountBalanceQuery()` returns the current account balance of an account on the Hedera network. 

| Constructor | Description |
| :--- | :--- |
| `AccountBalanceQuery()` | Initializes the AccountBalanceQuery object |

```java
new AccountBalanceQuery()
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAccountId(<account>)` | AccountId | The accountId of the account to retrieve the balance for |

## Example

```java
const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(operatorAccount, operatorPrivateKey);

    const balance = await new AccountBalanceQuery()
        .setAccountId(operatorAccount)
        .execute(client);

    console.log(`${operatorAccount} balance = ${balance.asTinybar()}`);
}

main();
```

|  |  |
| :--- | :--- |
|  |  |

