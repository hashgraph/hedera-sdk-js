# Transactions

Transactions are requests that are submitted by a client to a node in the Hedera network. Every transaction has a fee associated with it that will pay for processing the transaction. The following table lists the transaction type requests for each service.

| Cryyptocurrency Accounts | File Service | Smart Contracts |
| :--- | :--- | :--- |
| AccountCreateTransaction | FileCreateTransaction | ContractCreateTransaction |
| AccountUpdateTransaction | FileAppendTransaction | ContractUpdateTransaction |
| CryptoTransferTransaction | FileUpdateTransaction | ContractDeleteTransaction |
| AccountDeleteTransaction | FileDeleteTransaction |  |



The following methods can be called when building the above transaction types:

| Methods | Type | Description |
| :--- | :--- | :--- |
| `setMaxTransactionFee(<fee>)` | long | Sets the maximum fee, in tinybar, that the client is willing to pay to execute this transaction, which is split between the network and the node. The actual fee assessed may be less than this, in which case you will only be charged that amount. An error is thrown if the assessed fee is greater than this. |
| `setTransactionMemo(<memo>)` | String | Sets any notes or description that should be put into the transaction record \(if one is requested\). Note that a max of length of 100 is enforced. |
| `setTransactionValidDuration(<Duration>)` | Duration | The Duration in which the transaction will be valid from transactionValidStart time |
| `setNodeAccountId(<accountId>)` | AccountId | The account of the node that submits the client's transaction to the network |
| `setTransactionId(<transactionId>)` | TransactionId | The ID for this transaction, which includes the payer's account \(the account paying the transaction fee\). If two transactions have the same transactionID, they won't both have an effect |
| `build(<client>)` | Client | Builds the transaction |
| `sign(<key>)` | PrivateKey&lt;? extends PublicKey&gt; | Expliclity sign the transaction with a private key |
| `execute(<client>)` | Client | Submits the transaction to the Hedera network for consensus  |



## Transaction Receipt

The receipt of a transaction returns whether the transaction has reached consensus or not. It also returns the a new `accountId`, `consensusTopicId`, `contractId`, and `fileId` if generated in the transaction.

| Method | Type | Description |
| :--- | :--- | :--- |
| `getReceipt(<client>)` | TransactionReceipt | Gets the receipt for a transaction object |

```java
const transactionReceipt = await transactionId.getReceipt(client);
```

### Modifiers

| Modifier | Type | Description |
| :--- | :--- | :--- |
| `getAccountId()` | AccountId | The newly generated account ID |
| `getConsensusTopicId()` | ConsensusTopicId | The newly generated topic ID |
| `getConsensusTopicRunningHash()` | byte \[ \] | The topic running hash |
| `getConsensusTopicSequenceNumber()` | long | The topic sequence number |
| `getContractId()` | ContractId | The newly generated contract ID |
| `getFileId()` | FileId | The newly generated file ID |

```java
const transactionRecord = await transactionId.getRecord(client)
```

