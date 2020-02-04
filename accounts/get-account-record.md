# Get account record

`AccountRecordsQuery()` gets all of the records for an account for transfers into and out, that were above the threshold on that account, during the last 24 hours. 

The query header stipulates that the response should return the cost of the query or the actual response. The account ID is the account the record is for.

A record returns the following information about an account:

* Account ID
* Transaction ID
* Receipt
* Consensus Timestamp
* Transaction Hash
* Memo \(if any\)
* Transaction Fee
* Transfer List

| Constructor | Description |
| :--- | :--- |
| `AccountRecordsQuery()` | Initializes the AccountRecordsQuery object |

```javascript
new AccountRecordsQuery()
```

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAccountId(<accountId>)` | AccountId | The accountId of the account to return the record for |

## Example <a id="example"></a>

```text

```

