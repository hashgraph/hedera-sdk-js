# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v2.12.0-beta.1

### Added

 * `Client.[set|get]NodeMinReadmitPeriod()`
 * Support for using any node from the entire network upon execution
   if node account IDs have no been locked for the request.
 * Support for all integer widths for `ContractFunction[Result|Selector|Params]`

### Changed

 * Network behavior to follow a more standard approach (remove the sorting we
   used to do).

### Fixed

 * Ledger ID checksums
 * `Transaction.fromBytes()` should validate all the transaction bodies are the same

## v2.11.0-beta.1

### Added

 * `LocalWallet`
 * `LocalProvider`
 * `Provider`
 * `Signer`
 * `Wallet`
 * `SignerSignature`
 * Verbose logging using `js-logger`
 * `Client.setRequestTimeout()`

### Fixed

 * TLS for mirror nodes
 * Transactions should have an appropriate default (copied from Java SDK)
 * Min/max backoff for nodes should start at 8s to 60s
 * The current backoff for nodes should be used when sorting inside of network
   meaning nodes with a smaller current backoff will be prioritized
 * Chunked transactions (`FileAppendTransaction` and `TopicMessageSubmitTransaction`) should
   use the correct transation ID per transaction
 * Transaction removing signatures when calling `Transaction.[toBytes|getTransactionHash]()`

## v2.10.1

### Fixes

 * `NativeClient` IPs should have a port

## v2.10.0

### Added

 * `AddressBookQuery`
 * Status codes
 * `*[Transaction|Query].setGrpcDeadline()`
 * `*Allowance.ownerAccountId`

### Fixed

 * Mirror network incorrectly using `433` for TLS instead of `443`
 * `TransactionReceipt` protobuf encoding
 * `ContractId.fromString()`

## v2.10.0-beta.1

### Added

 * `AddressBookQuery`
 * Status codes
 * `*[Transaction|Query].setGrpcDeadline()`
 * `*Allowance.ownerAccountId`

## v2.9.1

### Fixed

 * Mirror network incorrectly using `433` for TLS instead of `443`
 * `TransactionReceipt` protobuf encoding
 * `ContractId.fromString()`

## v2.10.0-beta.1

### Added

 * `AddressBookQuery`
 * Status codes
 * `*[Transaction|Query].setGrpcDeadline()`
 * `*Allowance.ownerAccountId`

### Fixed

 * Mirror network incorrectly using `433` for TLS instead of `443`
 * `TransactionReceipt` protobuf encoding
 * `ContractId.fromString()`

## v2.9.0

### Added

 * `ContractId.fromEvmAddress()`
 * `ContractFunctionResult.stateChanges`
 * `ContractFunctionResult.evmAddress`
 * `ContractStateChange`
 * `StorageChange`
 * `[FileAppend|TopicMessageSubmit]Transaction.[set|get]ChunkSize()`, and changed default chunk size for `FileAppendTransaction` to 2048.
 * `AccountAllowance[Adjust|Approve]Transaction`
 * `TransactionRecord.tokenTransfersList`

## v2.9.0-beta.1

### Added

 * `ContractId.fromEvmAddress()`
 * `ContractFunctionResult.stateChanges`
 * `ContractFunctionResult.evmAddress`
 * `ContractStateChange`
 * `StorageChange`
 * `[FileAppend|TopicMessageSubmit]Transaction.[set|get]ChunkSize()`, and changed default chunk size for `FileAppendTransaction` to 2048.
 * `AccountAllowance[Adjust|Approve]Transaction`
 * `TransactionRecord.tokenTransfersList`
 * `AccountAllowance[Adjust|Approve]Transaction`
 * `AccountInfo.[hbar|token|tokenNft]Allowances`
 * `[Hbar|Token|TokenNft]Allowance`
 * `[Hbar|Token|TokenNft]Allowance`
 * `TransferTransaction.set[Hbar|Token|TokenNft]TransferApproval()`

## v2.8.0

### Added

 * Support for regenerating transaction IDs on demand if a request 
   responses with `TRANSACITON_EXPIRED`

### Fixed

 * `Transaction.sign()` should correctly save public keys and signers when sign on demand is disabled
 * `WebClient` failing to be constructed because its network was missing ports

## v2.8.0-beta.2

### Fixed

 * `Transaction.sign()` should correctly save public keys and signers when sign on demand is disabled
 * `WebClient` failing to be constructed because its network was missing ports

## v2.7.1

### Fixed

 * `WebClient` failing to be constructed because its network was missing ports

## v2.8.0-beta.1

### Added

 * Support for regenerating transaction IDs on demand if a request 
   responses with `TRANSACITON_EXPIRED`

## v2.7.0

### Added

 * `[Private|Public]Key.toAccountId()`
 * `TokenUpdateTransaction.[get|set]PauseKey()`
 * `TokenUpdateTransaction.setSupplyKey()`
 * Updated `Status` with new response codes
 * `AccountId.aliasKey`, including `AccountId.[to|from]String()` support.
 * `[PublicKey|PrivateKey].toAccountId()`.
 * `aliasKey` fields in `TransactionRecord` and `AccountInfo`.
 * `nonce` field in `TransactionId`, including `TransactionId.[set|get]Nonce()`
 * `children` fields in `TransactionRecord` and `TransactionReceipt`
 * `duplicates` field in `TransactionReceipt`
 * `[TransactionReceiptQuery|TransactionRecordQuery].[set|get]IncludeChildren()`
 * `TransactionReceiptQuery.[set|get]IncludeDuplicates()`
 * New response codes.
 * Support for ECDSA SecP256K1 keys.
 * `PrivateKey.generate[ED25519|ECDSA]()`
 * `[Private|Public]Key.from[Bytes|String][DER|ED25519|ECDSA]()`
 * `[Private|Public]Key.to[Bytes|String][Raw|DER]()`

### Fixed

 * Requests should retry on `INTERNAL` consistently
 * Signing data which contains bytes larger than a value of 127
 * `[Private|Public]Key.fromBytesEcdsa()` checking for the wrong bytes length

### Deprecated

 * `TokenUpdateTransaction.setsupplyKey()` - use `setSupplyKey()` instead
 * `PrivateKey.generate()`, use `PrivateKey.generate[ED25519|ECDSA]()` instead.

## v2.7.0-beta.4

### Fixed

 * Signing data which contains bytes larger than a value of 127
 * `[Private|Public]Key.fromBytesEcdsa()` checking for the wrong bytes length

## v2.7.0-beta.3

### Added

 * `TokenUpdateTransaction.[get|set]PauseKey()`
 * `TokenUpdateTransaction.setSupplyKey()`
 * Updated `Status` with new response codes

### Deprecated

 * `TokenUpdateTransaction.setsupplyKey()` - use `setSupplyKey()` instead

## v2.7.0-beta.2

### Added

 * `[Private|Public]Key.toAccountId()`

## v2.7.0-beta.1

### Added

 * `AccountId.aliasKey`, including `AccountId.[to|from]String()` support.
 * `[PublicKey|PrivateKey].toAccountId()`.
 * `aliasKey` fields in `TransactionRecord` and `AccountInfo`.
 * `nonce` field in `TransactionId`, including `TransactionId.[set|get]Nonce()`
 * `children` fields in `TransactionRecord` and `TransactionReceipt`
 * `duplicates` field in `TransactionReceipt`
 * `[TransactionReceiptQuery|TransactionRecordQuery].[set|get]IncludeChildren()`
 * `TransactionReceiptQuery.[set|get]IncludeDuplicates()`
 * New response codes.
 * Support for ECDSA SecP256K1 keys.
 * `PrivateKey.generate[ED25519|ECDSA]()`
 * `[Private|Public]Key.from[Bytes|String][DER|ED25519|ECDSA]()`
 * `[Private|Public]Key.to[Bytes|String][Raw|DER]()`

### Deprecated

 * `PrivateKey.generate()`, use `PrivateKey.generate[ED25519|ECDSA]()` instead.

### Fixed

 * Requests should retry on `INTERNAL` consistently

## v2.6.0

### Added

 * Support for multiple IPs per node
 * New smart contract response codes

### Fixed

 * `TransferTransaction` should deterministically order transfers before submitting transaction

## v2.6.0-beta.1

## Added

 * New smart contract response codes

## v2.5.0

### Fixed

 * `WebClient` should be able to construct an empty `MirrorNetwork`
 * Bad imports while using Common JS

### Deprecated

 * `ContractUpdateTransaction.[set|get]ByteCodeFileId()`
 * `ContractCallQuery.[set|get]MaxResultSize()`

## v2.5.0-beta.2

### Fixed

 * Bad imports while using Common JS

## v2.5.0-beta.1

### Deprecated

 * `ContractUpdateTransaction.[set|get]ByteCodeFileId()`
 * `ContractCallQuery.[set|get]MaxResultSize()`

## v2.4.1

### Fixed

 * Bad imports while using Common JS

## v2.4.0

### Added

 * TLS support
 * `Client.[get|set]TransportSecurity()` - Enable/Disable TLS
 * `*Id.toSolidityAddress()`
 * Support for `number` in all `ContractFunctionParam.add[Uint|Int]*()` methods

### Fixed

 * `*Id.fromSolidityAddress()`

## v2.3.0

### Added

 * `FreezeType`
 * `FreezeTransaction.[get|set]FreezeType()`
 * `FreezeTransaction.[get|set]FileId()`
 * `FreezeTransaction.[get|set]FileHash()`

### Deprecated

 * `FreezeTransaction.[get|set]UpdateFileId()`, use `.[get|set]FileId()` instead.

## v2.2.0

### Fixed

 * gRPC client not timing out on unresponsive connections

## v2.2.0-beta.1

### Added

 * Support for HIP-24 (token pausing)
    * `TokenInfo.pauseKey`
    * `TokenInfo.pauseStatus`
    * `TokenCreateTransaction.pauseKey`
    * `TokenUpdateTransaction.pauseKey`
    * `TokenPauseTransaction`
    * `TokenUnpauseTransaction`

## v2.1.1

### Fixed

 * UTF8 encoding and ecoding in React Native

## v2.1.0

### Added

 * Support for automatic token associations
    * `TransactionRecord.automaticTokenAssociations`
    * `AccountInfo.maxAutomaticTokenAssociations`
    * `AccountCreateTransaction.maxAutomaticTokenAssociations`
    * `AccountUpdateTransaction.maxAutomaticTokenAssociations`
    * `TokenRelationship.automaticAssociation`
    * `TokenAssociation`

### Fixed

 * `TransferTransaction.addHbarTransfer()` was not combining transfers

## v2.1.0-beta.1

### Added

 * Support for automatic token associations
    * `TransactionRecord.automaticTokenAssociations`
    * `AccountInfo.maxAutomaticTokenAssociations`
    * `AccountCreateTransaction.maxAutomaticTokenAssociations`
    * `AccountUpdateTransaction.maxAutomaticTokenAssociations`
    * `TokenRelationship.automaticAssociation`
    * `TokenAssociation`

## v2.0.30

### Added

 * `TokenNftInfo.toString()` - Stringifies the JSON representation of the current `TokenNftInfo`
 * `TokenNftInfo.toJson()` - JSON representation of the current `TokenNftInfo`
 * `Timestamp.toString()` - displays as `<seconds>.<nanos>`. Use `Timestamp.toDate()` to print differently

### Deprecated

 * `TokenNftInfoQuery.[set|get]AccountId()` with no replacement
 * `TokenNftInfoQuery.[set|get]TokenId()` with no replacement
 * `TokenNftInfoQuery.[set|get]Start()` with no replacement
 * `TokenNftInfoQuery.[set|get]End()` with no replacement
 * `TokenMintTransaction.[add|set]Metadata()` support for string metadata

## v2.0.29

### Added

 * Support for `CustomRoyaltyFees`
 * Updated `Status` with new response codes
 * Implemented `Client.[set|get]NetworkName()`

## v2.0.28

### Added

 * `Client.pingAll()` - pings all network nodes
 * `Client.[set|get]NodeWaitTime()` - minimum delay for nodes that are nto responding
 * `Client.[set|get]MaxAttempts()` - max number of attempts for each request
 * `Client.[set|get]MaxNodesPerTransaction()` - number of node account IDs to use per request
 * `CustomFixedFee.[set|get]HbarAmount()` - helper method to set both `denominatingTokenId` and `amount` when fee is an `Hbar` amount
 * `CustomFixedFee.setDenominatingTokenToSameToken()` - helper method to set `denominatingTokenId` to `0.0.0` which is not obvious

### Changed

 * `Client.ping()` will no longer throw an error

### Deprecated

 * `*[Transaction|Query].[set|get]MaxRetries()` - Use `*[Transaction|Query].[set|get]MaxAttempts()` instead

### Fixed

 * `PrivateKey.signTransaction()` and `PublicKey.verifyTransaction()` should correctly freeze an unfrozen transaction

## v2.0.27

### Added

 * Updated `Status` with new response codes
 * Support for `Hbar.[from|to]String()` to be reversible
 * `Client.setAutoValidateChecksums()` set whether checksums on ids will be automatically validated upon attempting to execute a transaction or query.  Disabled by default.  Check status with `Client.isAutoValidateChecksumsEnabled()`
 * `*Id.toString()` no longer stringifies with checksums.  Use `*Id.getChecksum()` to get the checksum that was parsed, or use `*Id.toStringWithChecksum(client)` to stringify with the correct checksum for that ID on the client's network.
 * `*Id.validateChecksum()` to validate a checksum.  Throws new `BadEntityIdException`

### Fixed

 * Free queries should not longer attempt to sign payment transactions
 * All enitty IDs within response should no longer contain a checskum. 
   Use `*Id.toStringWithChecksum(Client)` to stringify with a checksum
 * `ReceiptStatusError` should contain a properly filled out `TransactionReceipt`

### Deprecated

 * `*Id.validate()` use `*Id.validateChecksum()` instead

## v2.0.26

### Changed

 * Updated `Status` and `FeeDataType` with new codes

## v2.0.25

### Added

 * `TokenCreateTransaction.[get|set]FeeScheduleKey()`
 * Support for parsing file 0.0.111 using `FeeSchedules`

### Fixed

 * `TokenMintTransaction.[to|from]Bytes()` incorrectly parsing the transaction body

### Removed

 * `TokenCreateTransaction.addCustomFee()` - use `TokenCreateTransaction.setCustomFees()` instead

## v2.0.25-beta.1

### Added

 * Support for NFTS
    * Creating NFT tokens
    * Minting NFTs
    * Burning NFTs
    * Transfering NFTs
    * Wiping NFTs
    * Query NFT information
 * Support for Custom Fees on tokens:
    * Setting custom fees on a token
    * Updating custom fees on an existing token

### Fixed

 * Loading keystore should no longer error when `CipherAlgorithm` doesn't match case
 * `PrivateKey.legacyDerive()` should now be consistent with the v1.4.6 JS SDK

## v2.0.24

### Added

 * `Hbar.fromTinybar()` supports `BigNumber`
 * `Hbar.toString()` supports `HbarUnit`
 * Implemented to and from bytes for `TopicInfo` and `TokenInfo`
 * Support for `sign-on-demand`
    * This is disabled by default to you'll need to enable it using `Client.setSignOnDemand(true)`
    * If `sign-on-demand` is enabled you'll need to use `async` versions of these methods:
        * `*Transaction.toBytes()` -> `*Transaction.toBytesAsync()`
        * `*Transaction.getSignatures()` -> `*Transaction.getSignaturesAsync()`
        * `*Transaction.getTransactionHash()` -> `*Transaction.getTransactionHashAsync()`

### Changes

 * All requests now retry on gRPC status `INTERNAL` if error returned contains `RST_STREAM`

## v2.0.23

### Added

 * Added support for TLS on mirror node connections
 * Implemented `*Id.clone()` (this is used internally to fix some issues that only surface in React Native)
 * Implement `Timestamp.plusNanos()`
 * Added support for entity ID checksums. The network will be extracted from the checksum of the
   entity ID and validated on each request to make sure a request is not happening on one network
   while an entity ID references another network. Entity IDs with a network will print with a checksum
   while entity IDs without a checksum will not print the checksum part.

### Fixed

 * `TopicMessageQuery.startTime` not updating start time by one nanosecond causing a message to appear twice
   if the connection reset
 * `TopicMessageQuery` should log retries
 * `TransactionReceipt` error handling; this should now throw an error contain the receipt

## v2.0.22

### Fixed

 * `TopicMessageQuery.maxBackoff` was not being used at all
 * `TopicMessageQuery.limit` was being incorrectly update with full `TopicMessages` rather than per chunk
 * `TopicMessageQuery.startTime` was not being updated each time a message was received
 * `TopicMessageQuery.completionHandler` was be called at incorrect times

## v2.0.21

### Added

 * Exposed `AccountBalance.tokenDecimals`
 * Support for `string` parameters in `Hbar.fromTinybars()`
 * `Hbar.toBigNumber()` which is a simple wrapper around `Hbar.to(HbarUnit.Hbar)`
 * `AccountBalance.toJSON()`
 * Support for `maxBackoff`, `maxAttempts`, `retryHandler`, and `completionHandler` in `TopicMessageQuery`
 * Default logging behavior to `TopicMessageQuery` if an error handler or completion handler was not set

### Fixed

 * `TopicMessageQuery` retry handling; this should retry on more gRPC errors
 * `TopicMessageQuery` max retry timeout; before this would could wait up to 4m with no feedback
 * Missing `@readonly` tag on `TokenInfo.tokenMemo`
 * `Keystore` failing to recognize keystores generated by v1 SDKs
 * Errors caused by the use `?.` and `??` within a node 12 context
 * `TopicMessageQuery`

## v2.0.20

### Added

 * `PrivateKey.legacyDerive()` - Derive private key using legacy derivations
 * `Hbar.fromTinybars()` supports `string` parameter
 * `Hbar.toBigNumber()` aliases `Hbar.to(HbarUnit.Hbar)`
 * `AccountBalance.tokenDecimals` - Represents the decimals on a token
 * `AccountBalance.toString()` should print a `JSON.stringified()` output
 * `AccountBalance.toJSON()`

### Changed

 * `Mnemonic.toLegacyPrivateKey()` no longer automaticaly derives `PrivateKey`, instead produces root `PrivateKey`
   Use `PrivateKey.legacyDerive()` to derive the proper `PrivateKey` manually
 * Removed the use of `@hashgraph/protobufjs` in favor of `protobufjs`
   The reason `@hashgraph/protobufjs` even exists is because `protobufjs` contains `eval`
   which fails CSP in browser. However, while running integration tests through `vite` and
   `mocha` it seems the `eval` was never hit.
 * Moved from `yarn` to `pnpm` because of performance issues with `yarn`

## v2.0.19

### Added

 * Scheduled transaction support: `ScheduleCreateTransaction`, `ScheduleDeleteTransaction`, and `ScheduleSignTransaction`
 * React Native support
 * Support for raw `proto.Transaction` bytes in `Transaction.fromBytes()`
   * This means v1 SDK's `Transaction.toBytes()` will now be supported in v2 `Transaction.fromBytes()`
     However, `Transaction.toBytes()` and `Transaction.getTransactionHas()` in v2 will produce different
     results in the v1 SDK's.

### Fixed

 * addSignature() Behavior Differs Between Implementations [NCC-E001154-005]
 * Decreased `CHUNK_SIZE` 4096->1024 and increased default max chunks 10->20
 * Export `StatusError`, `PrecheckStatusError`, `ReceiptStatusError`, and `BadKeyError`
 * `KeyList.toString()`
 * `AccountBalance.toString()`

### Deprecated

 * `new TransactionId(AccountId, Instant)` - Use `TransactionId.withValidStart()` instead.

## v2.0.18 - Deprecated

## v2.0.17-beta.7

### Fixed

 * addSignature() Behavior Differs Between Implementations [NCC-E001154-005]
 * Decreased `CHUNK_SIZE` 4096->1024 and increased default max chunks 10->20
 * Renamed `ScheduleInfo.getTransaction()` -> `ScheduleInfo.getScheduledTransaction()`

## v2.0.17-beta.6

### Added

 * React Native support

## v2.0.17-beta.5 - Deprecated

## v2.0.17-beta.4

### Fixed

 * Scheduled transactions should use new HAPI protobufs
 * Removed `nonce` from `TransactionId`
 * `schedule-multi-sig-transaction` example to use new scheduled transaction API

### Removed
 * `ScheduleCreateTransaction.addScheduledSignature()`
 * `ScheduleCreateTransaction.scheduledSignatures()`
 * `ScheduleSignTransaction.addScheduledSignature()`
 * `ScheduleSignTransaction.scheduledSignatures()`

## v2.0.17-beta.3

### Added

 * Support for raw `proto.Transaction` bytes in `Transaction.fromBytes()`
   * This means v1 SDK's `Transaction.toBytes()` will now be supported in v2 `Transaction.fromBytes()`
     However, `Transaction.toBytes()` and `Transaction.getTransactionHas()` in v2 will produce different
     results in the v1 SDK's.
 * Export `StatusError`, `PrecheckStatusError`, `ReceiptStatusError`, and `BadKeyError`

### Fixed

 * A few examples that did not work with `CONFIG_FILE` environment variable

## v2.0.17-beta.2

### Added

 * Support for setting signatures on the underlying scheduled transaction
 * `TransactionReceipt.scheduledTransactionId`
 * `ScheduleInfo.scheduledTransactionId`
 * `TransactionRecord.scheduleRef`
 * Support for scheduled and nonce in `TransactionId`
   * `TransactionId.withNonce()` - Supports creating transaction ID with random bytes.
   * `TransactionId.[set|get]Scheduled()` - Supports scheduled transaction IDs.
 * `memo` fields for both create and update transactions and info queries
   * `Account[Create|Update]Transaction.[set|get]AccountMemo()`
   * `File[Create|Update]Transaction.[set|get]AccountMemo()`
   * `Token[Create|Update]Transaction.[set|get]AccountMemo()`
   * `AccountInfoQuery.accountMemo`
   * `FileInfoQuery.fileMemo`
   * `TokenInfoQuery.tokenMemo`

### Fixed

 * `ScheduleInfo.*ID` field names should use `Id`
   Ex. `ScheduleInfo.creatorAccountID` -> `ScheduleInfo.creatorAccountId`
 * Renamed `ScheduleInfo.memo` -> `ScheduleInfo.scheduleMemo`
 * Chunked transactions should not support scheduling if the data provided is too large
   * `TopicMessageSubmitTransaction`
   * `FileAppendTransaction`

## v2.0.17-beta.1

### Added

 * Support for scheduled transactions.
   * `ScheduleCreateTransaction` - Create a new scheduled transaction
   * `ScheduleSignTransaction` - Sign an existing scheduled transaction on the network
   * `ScheduleDeleteTransaction` - Delete a scheduled transaction
   * `ScheduleInfoQuery` - Query the info including `bodyBytes` of a scheduled transaction
   * `ScheduleId`

### Fixed

 * `KeyList.toString()`
 * `AccountBalance.toString()`

### Deprecated

 * `new TransactionId(AccountId, Instant)` - Use `TransactionId.withValidStart()` instead.

## v2.0.15

### Added
 * Implement `Client.forName()` to support construction of client from network name.
 * Implement `PrivateKey.verifyTransaction()` to allow a user to verify a transaction was signed with a partiular key.

## v2.0.14

### General Changes
    * All queries and transactions support setting fields in the constructor using
      an object, e.g. `new AccountBalanceQuery({ accountId: "0.0.3" })`, or
      `new AccountCreateTransaction({ key: client.operatorPublicKey, initialBalance: 10 })`.
    * Almost all instances of `BigNumber` have been replaced with `Long`

## v1.1.12

### Fixed

 * `Ed25519PrivateKey.fromMnemonic` regressed in v1.1.8 and was not working in the browser.

 * Use detached signatures when signing the transaction. This should allow for much larger transactions to be submitted.

## v1.1.11

### Fixed

 * `Ed25519PrivateKey.fromKeystore` regressed in v1.1.9 and was not working in the browser

## v1.1.10

### Added

  * `Client.ping(id: AccountIdLike)` Pings a node by account ID.

  * `Ed25519PrivateKey.fromMnemonic` works with legacy 22-word phrases.

### Deprecated

  * `Client.getAccountBalance()` to match the Java SDK. Use `AccountBalanceQuery` directly instead.

## v1.1.9

### Added

 * Allow BigNumber or String to be used as Tinybar where Tinybar was accepted

 * Add support for decoding `Ed25519PrivateKey` from a PEM file using `Ed25519PrivateKey.fromPem()`

 * Add support for passing no argument to `ContractFunctionResult.get*()` methods.

 * Add `MnemonicValidationResult` which is the response type for `Mnemonic.validte()`

 * Add public method `Mnemonic.validate(): MnemonicValidationResult` which validates if the mnemonic
   came from the same wordlist, in the right order, and without misspellings.

 * Add `BadPemFileError` which is thrown when decoding a pem file fails.

### Fixed

 * Fixes `AddBytes32Array`

 * Fixes `Hbar.isNegative()` failing with `undefined`.

 * Fixes `CryptoTransferTransaction.addTransfer()` not supporting `BigNumber` or
   `number` as arguments.

 * Fixes `ConsensusTopicInfoQuery.setTopicId()` not supporting `ConsensusTopicIdLike`.

### Deprecated

 * Deprecates `Client.maxTransactionFee` and `Client.maxQueryPayment` getters.

 * Deprecates `ConsensusTopicCreateTransaction.setAutoRenewAccount()` was simply
   renamed to `ConsensusTopicCreateTransaction.setAutoRenewAccountId()`.

 * Deprecates `ConsensusTopicCreateTransaction.setExpirationTime()` with no replacement.

 * Deprecates `ConsensusTopicCreateTransaction.setValidStart()` with no replacement.

 * Deprecates `ConsensusTopicUpdateTransaction.setAutoRenewAccount()` with no replacement.

## v1.1.8

### Fixed

 * `TransactionRecord.getContractCallResult` and `TransactionRecord.getContractExecuteResult` were swapped
    internally and neither worked before.

 * Export `ConsensusMessageSubmitTransaction`.

## v1.1.7

### Fixed

 * Do not provide (and sign) a payment transaction for `AccountBalanceQuery`. It is not required.

## v1.1.6

### Added

 * Add `TransactionBuilder.getCost()` to return a very close estimate of the transaction fee (within 1%).

 * Add additional error classes to allow more introspection on errors:
    * `HederaPrecheckStatusError` - Thrown when the transaction fails at the node (the precheck)
    * `HederaReceiptStatusError` - Thrown when the receipt is checked and has a failing status. The error object contains the full receipt.
    * `HederaRecordStatusError` - Thrown when the record is checked and it has a failing status. The error object contains the full record.

 * `console.log(obj)` now prints out nice debug information for several types in the SDK including receipts

## v1.1.5

### Added

 * Add `TransactionReceipt.getConsensusTopicId()`.

 * Add `TransactionReceipt.getConsensusTopicRunningHash()`.

 * Add `TransactionReceipt.getConsensusTopicSequenceNumber()`.

 * Adds support for addresses with a leading `0x` prefix with `ContractFunctionParams.addAddress()`.

### Deprecated

 * Deprecates `Client.putNode()`. Use `Client.replaceNodes()` instead.

 * Depreactes `Transaction.getReceipt()` and `Transaction.getRecord()`. Use `TransactionId.getReceipt()` or
   `TransactionId.getRecord()` instead. The `execute` method on `Transaction` returns a `TransactionId`.

 * Deprecates `ConsensusSubmitMessageTransaction`. This was renamed to `ConsensusMessageSubmitTransaction` to
   match the Java SDK.

## v1.1.2

### Fixed

 * https://github.com/hashgraph/hedera-sdk-js/issues/175

## v1.1.1

### Fixed

 * `RECEIPT_NOT_FOUND` is properly considered and internally retried within `TransactionReceiptQuery`

## v1.1.0

### Fixed

 * Contract parameter encoding with BigNumbers

### Added

Add support for Hedera Consensus Service (HCS).

 * Add `ConsensusTopicCreateTransaction`, `ConsensusTopicUpdateTransaction`, `ConsensusTopicDeleteTransaction`, and `ConsensusMessageSubmitTransaction` transactions

 * Add `ConsensusTopicInfoQuery` query (returns `ConsensusTopicInfo`)

 * Add `MirrorClient` and `MirrorConsensusTopicQuery` which can be used to listen for HCS messages from a mirror node.

### Changed

Minor version bumps may add deprecations as we improve parity between SDKs
or fix reported issues. Do not worry about upgrading in a timely manner. All v1+ APIs
will be continuously supported.

 * Deprecated `SystemDelete#setId`; replaced with `SystemDelete#setFileId` or `SystemDelete#setContractId`

 * Deprecated `SystemUndelete#setId`; replaced with `SystemUndelete#setFileId` or `SystemUndelete#setContractId`

 * Deprecated `Hbar.of(val)`; replaced with `new Hbar(val)`

 * Deprecated `FreezeTransaction#setStartTime(Date)`; replaced with `FreezeTransaction#setStartTime(hour: number, minute: number)`

 * Deprecated `FreezeTransaction#setEndTime(Date)`; replaced with `FreezeTransaction#setEndTime(hour: number, minute: number)`

 * All previous exception types are no longer thrown. Instead there are a set of new exception types to match the Java SDK.

   * `HederaError` becomes `HederaStatusError`
   * `ValidationError` becomes `LocalValidationError`
   * `TinybarValueError` becomes `HbarRangeError`
   * `MaxPaymentExceededError` becomes `MaxQueryPaymentExceededError`
   * `BadKeyError` is a new exception type when attempting to parse or otherwise use a key that doesn't look like a key

## v1.0.1

### Added

 * Allow passing a string for a private key in `Client.setOperator`

### Fixed

 * Correct list of testnet node addresses

## v1.0.0

No significant changes since v1.0.0-beta.5

## v1.0.0-beta.5

### Fixed

 * Fix `getCost` for entity Info queries where the entity was deleted

### Added

 * Add support for unsigned integers (incl. Arrays) for contract encoding and decoding

 * Add `AccountUpdateTransaction.setReceiverSignatureRequired`

 * Add `AccountUpdateTransaction.setProxyAccountId`

### Changed

 * Rename `ContractExecuteTransaction.setAmount()` to `ContractExecuteTransaction.setPayableAmount()`

## v1.0.0-beta.4

### Added

 * `Client.forTestnet` makes a new client configured to talk to TestNet (use `.setOperator` to set an operater)

 * `Client.forMainnet` makes a new client configured to talk to Mainnet (use `.setOperator` to set an operater)

### Changed

 * Renamed `TransactionReceipt.accountId`, `TransactionReceipt.contractId`, `TransactionReceipt.fileId`, and
   `TransactionReceipt.contractId` to `TransactionReceipt.getAccountId()`, etc. to add an explicit illegal
   state check as these fields are mutually exclusive

 * Renamed `TransactionRecord.contractCallResult` to `TransactionRecord.getContractExecuteResult()`

 * Renamed `TransactionRecord.contractCreateResult` to `TransactionRecord.getContractCreateResult()`

## v1.0.0-beta.3

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
