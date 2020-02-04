# Update an account

`AccountUpdateTransaction()` updates/changes the properties for an existing account. Any null field is ignored \(left unchanged\). Any of the following properties can be updated for an account:

* Key\(s\)
* Auto Renew Period
* Expiration Time
* Send Record Threshold
* Receive Record Threshold 
* Proxy Account

{% hint style="danger" %}
The account must be signed by the **old key\(s\)** and **new key\(s\)** when updating the keys of an account. In the case of threshold keys, only the 
{% endhint %}

| Constructor | Description |
| :--- | :--- |
| `AccountUpdateTransaction()` | Initializes the AccountUpdateTransaction object |

```java
new AccountUpdateTransaction()
```



<table>
  <thead>
    <tr>
      <th style="text-align:left">Methods</th>
      <th style="text-align:left">Type</th>
      <th style="text-align:left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>setAccountForUpdate(&lt;accountId&gt;)</code>
      </td>
      <td style="text-align:left">AccountId</td>
      <td style="text-align:left">
        <p>The ID of the account to update in this transaction</p>
        <p><em>default:  None</em>
        </p>
        <p></p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setKey(&lt;key&gt;)</code>
      </td>
      <td style="text-align:left">Ed25519PublicKey</td>
      <td style="text-align:left">
        <p>The public key generated for the new account.</p>
        <p><em>default:  None</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setAutoRenewPeriod(&lt;seconds)</code>
      </td>
      <td style="text-align:left">number</td>
      <td style="text-align:left">
        <p>The period of time in which the account will auto-renew in seconds. Duration
          type is in seconds. For example, one hour would result in the input value
          of <code>3600 </code>seconds</p>
        <p><em>default:  None</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setExpirationTime(&lt;date&gt;)</code>
      </td>
      <td style="text-align:left">number</td>
      <td style="text-align:left">
        <p>The new expiration time to extend to.</p>
        <p><em>default:  None</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setSendRecordThreshold(&lt;sendRecordThreshold&gt;)</code>
      </td>
      <td style="text-align:left">number</td>
      <td style="text-align:left">
        <p>Creates a record for any transaction that withdraws more than x value
          of tinybars.</p>
        <p><em>default:  None</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setReceiveRecordThreshold(&lt;receiveRecordThreshold)</code>
      </td>
      <td style="text-align:left">number</td>
      <td style="text-align:left">
        <p>Creates a record for any transaction that deposits more than x value of
          tinybars.</p>
        <p><em>default:  None</em>
        </p>
      </td>
    </tr>
  </tbody>
</table>#### Example

```java
const { Client, Ed25519PrivateKey, AccountCreateTransaction, AccountUpdateTransaction, AccountInfoQuery, AccountId} = require("@hashgraph/sdk");
require("dotenv").config();

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

    // First, we create a new account so we don't affect our account

    const privateKey = await Ed25519PrivateKey.generate();
    const publicKey = await privateKey.publicKey;

    console.log(`private = ${privateKey.toString()}`);
    console.log(`public = ${privateKey.publicKey.toString()}`);

    const transactionId = await new AccountCreateTransaction()
        .setKey(publicKey)
        .setInitialBalance(0)
        .execute(client);

    // Get the account ID for the new account
    const transactionReceipt = await transactionId.getReceipt(client);
    const accountId = transactionReceipt.getAccountId();
    console.log(`account = ${accountId}`);

    // Create new keys
    const newPrivateKey = await Ed25519PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    console.log(`:: update keys of account ${accountId}`)
    console.log(`setKey = ${newPublicKey}`)

    //Update the key on the account
    const updateTransaction = await new AccountUpdateTransaction()
        .setAccountId(accountId)
        .setKey(newPublicKey) // The new public key to update the account with
        .build(client)
        .sign(privateKey) // Sign with the original private key on account
        .sign(newPrivateKey) // Sign with new private key on the account
        .execute(client);

    console.log(`transactionId = ${updateTransaction}`)

    // (important!) wait for the transaction to complete by querying the receipt
    updateTransaction.getReceipt(client);

    console.log(`:: get account info and check our current key`);

   // Now we fetch the account information to check if the key was changed
    const acctInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client); 

    console.log(`key = ${acctInfo.key}`)
}
main();
```

