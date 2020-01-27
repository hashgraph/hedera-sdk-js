# Call a smart contract function

`ContractCallQuery()` calls a function from a smart contract instance without updating its state or requiring consensus.

| Constructor | Description |
| :--- | :--- |
| `ContractCallQuery()` | Initializes a ContractCallQuery object |

```java
new ContractCallQuery()
```

## Basic

| Method | Type | Description |
| :--- | :--- | :--- |
| `setContractId(<contractId>)` | ContractId | The ID of the contract instance to call |
| `setGas(<gas>)` | number | Gas amount to run the constructor |
| `setFunctionParameters(<parameters>)` | byte \[ \] | Which funtion to call from the contract instance and the parameters |
| `setFunction(<functionName>)` | String | The name of the function in String format |
| `setMaxResultSize(<size>)` | number | Max number of bytes that the result might include. The run will fail if it would have returned more than this number of bytes. |

