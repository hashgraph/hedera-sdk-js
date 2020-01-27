# Queries

Queries are requests that do not require network consensus. Queries are processed only by the single node the request is sent to. Below is a list of network queries by service.

| Cryptocurrency Accounts | File Service | Smart Contracts |
| :--- | :--- | :--- |
| AccountBalanceQuery | FileContentsQuery | ContractCallQuery |
| AccountInfoQuery | FileInfoQuery | ContractByteCodeQuery |
| AccountRecordQuery |  | ContractInfoQuery |
|  |  | ContractRecordQuery |

The following methods can be called when building the above queries

| Method | Type | Description |
| :--- | :--- | :--- |
| `setQueryPayment(<paymentAmount>)` | Hbar | Explicitly specify that the operator account is paying for the query; when the query is executed a payment transaction will be constructed with a transfer of this amount from the operator account to the node which will handle the query. |
| `setQueryPayment(<paymentAmount>)` | long | Explicitly specify that the operator account is paying for the query; when the query is executed a payment transaction will be constructed with a transfer of this amount from the operator account to the node which will handle the query. |
| `setMaxQueryPayment(<paymentAmount>)` | Hbar | The maximum payment amount to be paid for this query. The actual payment amount may be less, but will never be greater than this value. |
| `setMaxQueryPayment(<paymentAmount>)` | long | The maximum payment amount to be paid for this query. The actual payment amount may be less, but will never be greater than this value. |
| `getCost(<client>)` | Client | Returns the cost of the query prior to submitting the request |
| `execute(<client>)` | Client | Submits the transaction to the Hedera network |

