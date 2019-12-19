# Get account balance

You can quickly obtain an account balance by invoking the `getAccountBalance()` method on the client object.

| Method | Type | Description |
| :--- | :--- | :--- |
| `getAccountBalance(<accountId>)` | [AccountId]() | Get the balance of an account |

```javascript
// Returns the account balance of th operator account 
console.log('current account balance:', await client.getAccountBalance());
```

