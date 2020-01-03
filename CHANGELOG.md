# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.1-beta.4

### Added

 * `Client.forTestnet` makes a new client configured to talk to TestNet (use `.setOperator` to set an operater)
 
 * `Client.forMainnet` makes a new client configured to talk to Mainnet (use `.setOperator` to set an operater)

### Changed

 * Renamed `TransactionReceipt.accountId`, `TransactionReceipt.contractId`, `TransactionReceipt.fileId`, and
   `TransactionReceipt.contractId` to `TransactionReceipt.getAccountId()`, etc. to add an explicit illegal 
   state check as these fields are mutually exclusive
   
 * Renamed `TransactionRecord.contractCallResult` to `TransactionRecord.getContractExecuteResult()`
 
 * Renamed `TransactionRecord.contractCreateResult` to `TransactionRecord.getContractCreateResult()`

## v1.0.1-beta.3

### Changed

 * `TransactionBuilder.setMemo` is renamed to `TransactionBuilder.setTransactionMemo` to avoid confusion 
   as there are 2 other kinds of memos on transactions
 
### Fixed

 * Fix usage on Node versions less than 12.x

## v1.0.0-beta.2

### Changed

 * `CallParams` is removed in favor of `ContractFunctionParams` and closely mirrors type names from solidity
    * `addInt32`
    * `addInt256Array`
    * `addString`
    * etc.

 * `ContractFunctionResult` now closely mirrors the solidity type names
   * `getInt32`
   * etc.

 * `setFunctionParams(params)` on `ContractCallQuery` and `ContractExecuteTransaction` is now
   `setFunction(name, params)`
   
 * `ContractLogInfo.topicList` -> `ContractLogInfo.topics`
 
 * `FileInfo.deleted` -> `FileInfo.isDeleted`
 
 * `FileContentsQuery.execute` now directly returns `Uint8Array`

 * `ContractRecordsQuery.execute` now directly returns `TransactionRecord[]`

 * `AccountAmount.amount` (`String`) -> `AccountAmount.amount` (`Hbar`)

 * TransactionReceipt
    * `receiverSigRequired` -> `isReceiverSignatureRequired`
    * `autoRenewPeriodSeconds` -> `autoRenewPeriod`

### Fixed

 * Remove incorrect local validation for FileCreateTransaction and FileUpdateTransaction
 
 * Any `key` fields on response types (e.g., `AccountInfo`) are
   now `PublicKey` and can be any of the applicable key types
   
 * Fix transaction back-off when BUSY is returned
 
 * Default autoRenewPeriod on ContractCreate appropriately
 
## v0.8.0-beta.3

### Changed

 * Client constructor takes the network as `{ network: ... }` instead of `{ nodes: ... }`

 * Transactions and queries do not take `Client` in the constructor; instead, `Client` is passed to `execute`.

 * Removed `Transaction.executeForReceipt` and `Transaction.executeForRecord`

    These methods have been identified as harmful as they hide too much. If one fails, you do not know if the transaction failed to execute; or, the receipt/record could not be retrieved. In a mission-critical application, that is, of course, an important distinction.

    Now there is only `Transaction.execute` which returns a `TransactionId`. If you don't care about waiting for consensus or retrieving a receipt/record in your application, you're done. Otherwise you can now use any `TransactionId` and ask for the receipt/record (with a stepped retry interval until consensus) with `TransactionId.getReceipt` and `TransactionId.getRecord`.

    v0.7.x and below

    ```js
    let newAccountId = new AccountCreateTransaction(hederaClient)
        .setKey(newKey.publicKey)
        .setInitialBalance(1000)
        .executeForReceipt() // TransactionReceipt
        .accountId;
    ```

    v0.8.x and above

    ```js
    let newAccountId = new AccountCreateTransaction()
        .setKey(newKey.publicKey)
        .setInitialBalance(1000)
        .execute(hederaClient) // TranactionId
        .getReceipt(hederaClient) // TransactionReceipt
        .accountId;
    ```

 * Rename `setPaymentDefault` to `setPaymentAmount`

### Added

 * All transaction and query types that were in the Java SDK but not yet in the JS SDK (GetBySolidityIdQuery, AccountStakersQuery, etc.)

 * `TransactionId.getReceipt`

 * `TransactionId.getRecord`

 * `Transaction.toString`. This will dump the transaction (incl. the body) to a stringified JSON object representation of the transaction. Useful for debugging.

 * A default of 1 Hbar is now set for both maximum transaction fees and maximum query payments.
 
 * Smart Contract type encoding and decoding to match Java. 

 * To/From string methods on AccountId, FileId, etc.

 * Internal retry handling for Transactions and Queries (incl. BUSY)

### Removed

 * `Transaction` and `Query` types related to claims
