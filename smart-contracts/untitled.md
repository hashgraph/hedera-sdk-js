# Create a smart contract

`ContractCreateTransaction()` creates a new smart contract instance. The ID of the smart contract can be obtained from the record or receipt. The instance will run the bytecode stored in the given file, referenced either by FileID or by the transaction ID of the transaction that created the file. The constructor will be executed using the given amount of gas. Similar to accounts, the instance will exist for autoRenewSeconds and when it is reached the instance will renew itself for another autoRenewSeconds seconds. The associated cryptocurrency account will be charged for each auto-renew period.

{% hint style="warning" %}
**Smart Contract State Size**

Each smart contract has a maximum state size of 1MB which can store up to approximately 16,000 key-value pairs.
{% endhint %}

| Constructor | Description |
| :--- | :--- |
| `ContractCreateTransaction()` | Initializes the ContractCreateTransaction\(\) |

```java
new ContractCreateTransaction()
```

## Basic

| Method | Type | Description |
| :--- | :--- | :--- |
| `setAdminKey(<key>)` | Ed25519PublicKey | The state of the instance and its fields can be modified arbitrarily if this key signs a transaction to modify it. If this is null, then such modifications are not possible, and there is no administrator that can override the normal operation of this smart contract instance. |
| `setByteCodeFile(<fileId>)` | FileId | The `fileId` of the file that contains the smart contract bytecode |
| `setGas(<gas>)` | number | Gas amount to run the constructor |
| `setInitialBalance(<amount>)` | number | The initial number of tinybars to put into the cryptocurrency account associated with and owned by the smart contract. |
| `setAutoRenewPeriod(<duration>)` | Duration | The period of time in which the smart contract will auto-renew in seconds. Duration type is in seconds. For example, one hour would result in the input value of 3600 seconds. |

```java

```

