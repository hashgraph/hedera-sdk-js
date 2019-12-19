# Get account info

`AccountInfoQuery()` returns all of the information about an account. This **does not** include the list of records associated with the account.

This information includes:

* Account ID
* Key\(s\)
* Balance
* Expiration time
* AutoRenewPeriod
* Whether the account is deleted or not
* Whether the receiver signature is required or not
* The proxy account ID, if any



| Constructor | Description |
| :--- | :--- |
| `AccountInfoQuery()` | Initializes the AccountInfoQuery object |

```javascript
new AccountInfoQuery()     
    .setAccountId()     
    .execute();
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAccountId(<accountId>)` | AccountId | The accountId of the account to return the information for |

## Example <a id="example"></a>

```javascript
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

    const info = await new AccountInfoQuery()
        .setAccountId(operatorAccount)
        .execute(client);

    console.log(`${operatorAccount} info = ${JSON.stringify(info, null, 4)}`);
```

