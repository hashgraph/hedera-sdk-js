# Get smart contract info

`ContractInfoQuery()` returns information about a smart contract instance.

* Account ID
* Contract ID
* Receipt
* Expiration time
* Number of bytes of storage bein used
* Memo

| Constructor | Description |
| :--- | :--- |
| `ContractInfoQuery()` | Initializes a ContractCallInfoQuery object |

```javascript
new ContractInfoQuery()
```

## Basic

| Method | Type | Description |
| :--- | :--- | :--- |
| `setContractId(<contractId>)` | ContractId | The ID of the smart contract to return the information for |

