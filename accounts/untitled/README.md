# Create an account

The account represents your account specific to the Hedera network. Accounts are required to utilize the Hedera network services and to pay network transaction fees. 

{% hint style="info" %}
When creating a **new account** an existing account will need to fund the initial balance and pay for the transaction fee.
{% endhint %}

| Constructor | Description |
| :--- | :--- |
| `AccountCreateTransaction()` | Initializes the AccountCreateTransaction object |

```javascript
new AccountCreateTransaction()
  .setKey()
  .setInitialBalance()
  .setMaxTransactionFee()
  .setAutoRenewPeriod()
  .setReceiverSignatureRequired()
  .setReceiveRecordThreshold()
  .setSendRecordThreshold()
  .build();
```

### 

<table>
  <thead>
    <tr>
      <th style="text-align:left">Methods</th>
      <th style="text-align:center">Type</th>
      <th style="text-align:left">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><code>setKey(&lt;key&gt;)</code>
      </td>
      <td style="text-align:center">Ed25519PrivateKey</td>
      <td style="text-align:left">The private key generated for the new account.</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setInitialBalance(&lt;amount&gt;)</code>
      </td>
      <td style="text-align:center">uint64</td>
      <td style="text-align:left">The initial balance for the account in tinybars</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setMaxTransactionFee(&lt;fee&gt;)</code>
      </td>
      <td style="text-align:center">long</td>
      <td style="text-align:left">The maximum fee to be paid for this transaction executed by this client.
        The actual fee may be less, but will never be greater than this value.</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setAutoRenewPeriod(&lt;number&gt;)</code>
      </td>
      <td style="text-align:center">seconds</td>
      <td style="text-align:left">
        <p>The period of time in which the account will auto-renew in seconds. The
          account is charged tinybars for every auto-renew period. Duration type
          is in seconds. For example, one hour would result in the input value of
          3,600 seconds.NOTE: This is fixed to approximately 3 months (7890000 seconds).
          Any other value will return the following error: AUTORENEW_DURATION_NOT_IN_RANGE.</p>
        <p><em>default: 2,592,000 seconds</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setReceiverSignatureRequired(&lt;boolean&gt;)</code>
      </td>
      <td style="text-align:center">boolean</td>
      <td style="text-align:left">
        <p>If true, all the account keys must sign any transaction depositing into
          this account (in addition to all withdrawals)</p>
        <p><em>default: false</em>
        </p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setReceiveRecordThreshold(&lt;receiveRecordThreshold&gt;)</code>
      </td>
      <td style="text-align:center">long</td>
      <td style="text-align:left">Creates a record for any transaction that deposits more than x value of
        tinybars.</td>
    </tr>
    <tr>
      <td style="text-align:left"><code>setSendRecordThreshold(&lt;sendRecordThreshold&gt;)</code>
      </td>
      <td style="text-align:center">long</td>
      <td style="text-align:left">Creates a record for any transaction that withdraws more than x value
        of tinybars.</td>
    </tr>
  </tbody>
</table>## Example:

```javascript
const transactionId = await new AccountCreateTransaction()
    .setKey(privateKey.publicKey)
    .setInitialBalance(0)
    .execute(client);

const transactionReceipt = await transactionId.getReceipt(client);
const newAccountId = transactionReceipt.accountId;

console.log(`account = ${newAccountId}`)
```

