# Update a smart contract

`ContractUpdateTransaction()` updates an existing smart contract instance to the given parameter values. Any null field is left unchanged.

| Constructor | Description |
| :--- | :--- |
| `ContractUpdateTransaction()` | Initializes the ContractUpdateTransaction object |

```java
new ContractUpdateTransaction()
```

## Basic

| Method | Type | Description |
| :--- | :--- | :--- |
| `setContractId(<contractId>)` | ContractId | The contract ID instance to update |
| `setFileId(<fileId>)` | FileId | The file ID of file containing the smart contract bytecode |
| `setAdminKey(<key>)` | Ed25519PublicKey | The state of the instance can be modified arbitrarily if this key signs a transaction to modify it. If this is null, then such modifications are not possible, and there is no administrator that can override the normal operation of this smart contract instance. |
| `setAutoRenewPeriod(<duration>)` | Duration | The instance will charge its account every this many seconds to renew for this long. Duration type is in seconds. For example, one hour duration would result in the value of 3,600 seconds. |
| `setExpirationTime(<expiration>)` | Instant | Extend the expiration of the instance and its account to this time. |
| `setProxyAccount(<accountId>)` | AccountId | ID of the account to which this account is proxy staked. |

