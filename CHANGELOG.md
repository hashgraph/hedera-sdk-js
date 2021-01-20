# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v2.0.14

### General Changes
    * All queries and transactions support setting fields in the constructor using
      an object, e.g. `new AccountBalanceQuery({ accountId: "0.0.3" })`, or
      `new AccountCreateTransaction({ key: client.operatorPublicKey, initialBalance: 10 })`.
    * Almost all instances of `BigNumber` have been replaced with `Long`

### Renamed `Time` -> `Timestamp`

### Renamed `Ed25519PublicKey` -> `PublicKey`
    * Added `verify(Uint8Array, Uint8Array): boolean`
        * Verifies a message was signe by the respective private key.
    * Added `verifyTransaction(Transaction): boolean`
        * Verifies the transaction was signed by the respective private key.
    * Removed`toString(boolean): string`

### Renamed `Ed25519PrivateKey` -> `PrivateKey`
    * Added `signTransaction(Transaction): Uint8Array`
        * Signs the `Transaction` and returns the signature.
    * Added `publicKey: PublicKey`
    * Added `fromLegacyMnemonic(Uint8Array): PrivateKey`
    * Added `isDerivable(): boolean`
    * Removed `Promise<PrivateKey> derive2(number)`
        * This is now default behavior for `PrivateKey.derive()`

### Removed `ThresholdKey`
    * Use `KeyList.setThreshold()` instead

### Renamed `PublicKey` -> `Key`
    * Addeded by `PublicKey`
    * Addeded by `PrivateKey`
    * Addeded by `KeyList`
    * Addeded by `ContractId`

### `KeyList`
    * Exposed `threshold: number`
    * Added `of(Key[]): KeyList`
    * Added `from(ArrayLike<Key>): KeyList`

### `Mnemonic`
    * Added `Mnemonic.fromWords(string[])`
    * Added `toPrivateKey(string): PrivateKey`
    * Added `Promise<Mnemonic> generate12()`
    * Removed `Mnemonic({ words, legacy}: { words: string[], legacy: boolean }): new`
        * Use `Mnemonic.fromWords(string[])` instead.
    * Removed `validate(): MnemonicValidationResult`

### Renamed `MnemonicValidationResult` -> `BadMnemonicError`
    * Added `mnemonic: Mnemonic`
    * Added `reason: BadMnemonicReason`
    * Removed`isOk(): boolean`
    * Removed`toString(): string`
    * Removed`status: MnemonicValidationStatus`

### Renamed `MnemonicValidationStatus` -> `BadMnemonicReason`
    * Removed `Ok`
    * Removed `UnknownLegacyWords`

### Removed `MirrorClient`
    * Use `Client` instead, and set the mirror network using `setMirrorNetwork()`

### Renamed `MirrorSubscriptionHandle` -> `SubscriptionHandle`

### Renamed `QueryBuilder` -> `Query`
    * Changed `Promise<number> getCost(Client)` -> `Promise<Hbar> getCost(Client)`
    * Removed `setPaymentTransaction()`
    * Removed `setQueryPayment(number)`
    * Removed `setMaxQueryPayment(number)`

### Combined `TransactionBuilder` and `Transaction`
    * Added `fromBytes(Uint8Array): Transaction`
    * Added `toBytes(): Uint8Array`
    * Added `transactionId: TransactionId`
    * Added `maxTransactionFee: Hbar`
    * Added `transactionMemo: string`
    * Added `Map<AccountId, Uint8Array> getTransactionHashPerNode()`
    * Added `transactionValidDuration: Duration`
    * Added `signWithOpeator(Client): Transaction`
    * Added `addSignature(PublicKey, Uint8Array): Transaction`
    * Added `Map<AccountId, Map<PublicKey, Uint8Array>> getSignatures()`
    * Changed `Promise<TransactionId> execute(Client)` -> `Promise<TransactionResponse> execute(Client)`
    * Renamed `hash()` -> `Uint8Array getTransactionHash(): Uint8Array`
    * Renamed `build(null)` -> `Transaction freeze(): Transaction`
    * Renamed `build(Client)` -> `Transaction freezeWith(Client): Transaction`
    * Removed `id: TransactionId`
    * Removed `setMaxQueryPayment(number)`
    * Renamed `setNodeId(AccountId)` -> `setNodeAccountIds(AccountId[])`
    * Removed `Promise<Hbar> getCost(Client)`
    * Removed `setGenerateRecord(boolean)`

### `AccountBalanceQuery` extends [Query](#renamed-querybuilder-query)
    * Added `accountId: AccountId`
    * Added `contractId: ContractId`
    * Added `setContractId(ContractId)`
    * Changed `execute(Client)` -> `AccountBalance execute(Client): Hbar`

### Added `AccountBalance`
    * Added `balance: Hbar`
    * Added `Map<TokenId, number> tokenBalances`

### `AccountCreateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `key: Key`
    * Added `initialBalance: Hbar`
    * Added `receiverSignatureRequired: boolean`
    * Added `proxyAccountId: AccountId`
    * Added `autoRenewPeriod: Duration`
    * Removed `setSendRecordThreshold(number)` and `setSendRecordThreshold(Hbar)`
    * Removed `setReceiveRecordThreshold(number)` and `setReceiveRecordThreshold(Hbar)`

### `AccountDeleteTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `accountId: AccountId`
    * Added `transferAccountId: AccountId`
    * Renamed `setDeleteAccountId()` -> `setAccountId()`

### `AccountId`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): AccountId`
    * Renamed `account: number` -> `num: number`

### `AccountInfo`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): AccountInfo`
    * Added `LiveHash[] liveHashes`
    * Renamed `generateSendRecordThreshold` -> `sendRecordThreshold`
    * Renamed `generateReceiveRecordThreshold` -> `receiveRecordThreshold`

### `AccountInfoQuery` extends [Query](#renamed-querybuilder-query)
    * Added `accountId: AccountId`

### `AccountRecordsQuery` extends [Query](#renamed-querybuilder-query)
    * Added `accountId: AccountId`

### `AccountStakersQuery` extends [Query](#renamed-querybuilder-query)
    * Added `accountId: AccountId`

### `AccountUpdateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `accountId: AccountId`
    * Added `key: Key`
    * Added `initialBalance: Hbar`
    * Added `receiverSignatureRequired: boolean`
    * Added `proxyAccountId: AccountId`
    * Added `autoRenewPeriod: Duration`
    * Added `expirationTime: Timestamp`
    * Removed `setSendRecordThreshold(number)` and `setSendRecordThreshold(Hbar)`
    * Removed `setReceiveRecordThreshold(number)` and `setReceiveRecordThreshold(Hbar)`

### Removed `CryptoTransferTranscation`
    * Use `TransferTransaction` instead.

### `TransferTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `addTokenTransfer(TokenId, AccountId, number): TransferTransaction`
    * Added `Map<TokenId, Map<AccountId, number>> getTokenTransfers()`
    * Added `addHbarTransfer(AccountId, Hbar): TransferTransaction`
    * Added `Map<AccountId, Hbar> getHbarTransfers()`

### Renamed `ContractBytecodeQuery` -> `ContractByteCodeQuery` extends [Query](#renamed-querybuilder-query)
    * Added `contractId: ContractId`

### `ContractCallQuery` extends [Query](#renamed-querybuilder-query)
    * Added `contractId: ContractId`
    * Added `gas: number`
    * Added `getFunctionParameters(): Uint8Array`

### `ContractCreateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `bytecodeFileId: FileId`
    * Added `adminKey: Key`
    * Added `gas: number`
    * Added `initialBalance: Hbar`
    * Added `autoRenewDuration: Duration`
    * Added `proxyAccountId: AccountId`
    * Added `contractMemo: string`
    * Added `getConstructorParameters(): Uint8Array`

### `ContractDeleteTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `contractId: ContractId`
    * Added `transferAccountId: AccountId`
    * Added `transferContractId: ContractId`

### `ContractExecuteTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `contractId: ContractId`
    * Added `gas: number`
    * Added `payableAmount: Hbar`
    * Added `getFunctionParameters(): Uint8Array`

### `ContractId`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): ContractId`
    * Renamed `contract: number` -> `num: number`

### `ContractInfo`
    * Added `toBytes(): Uint8Array`
    * Added `isDeleted: boolean`
    * Added `fromBytes(Uint8Array): ContractInfo`
    * Changed `autoRenewPeriod: number` -> `autoRenewPeriod: Duration`

### `ContractInfoQuery` extends [Query](#renamed-querybuilder-query)
    * Added `contractId: ContractId`

### Removed `ContractRecordsQuery`

### `ContractUpdateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `contractId: ContractId`
    * Added `bytecodeFileId: FileId`
    * Added `adminKey: Key`
    * Added `autoRenewDuration: Duration`
    * Added `proxyAccountId: AccountId`
    * Added `contractMemo: string`
    * Added `expirationTime: Timestamp`

### `FileAppendTransaction`
    * Added `fileId: FileId`
    * Added `maxChunks: number`
    * Added `getContents(): Uint8Array`
    * Added `setMaxChunks(number)`

### `FileContentsQuery`
    * Added `fileId: FileId`

### `FileCreateTransaction`
    * Added `contents: Uint8Array`
    * Added `Key[] keys`
    * Added `expirationTime: Timestamp`
    * Renamed `addKey(Key)` -> `setKeys(Key...)`

### `FileDeleteTransaction`
    * Added `fileId: FileId`

### `FileId`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): FileId`
    * Renamed `file: number` -> `num: number`
    * Removed`fromSolidityAddress(): FileId`
    * Removed`toSolidityAddress(): string`

### `FileInfo`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): FileInfo`
    * Update `PublicKey[] keys` -> `keys: KeyList`

### `FileInfoQuery`
    * Added `fileId: FileId`

### `FileUpdateTransaction`
    * Added `fileId: FileId`
    * Added `getContents(): Uint8Array`
    * Added `Collection<Key> getKeys()`
    * Added `expirationTime: Timestamp`
    * Renamed `addKey(Key)` -> `setKeys(Key...)`

### Renamed  `MirrorConsensusTopicResponse` -> `TopicMessage`
    * Renamed `message: Uint8Array` -> `contents: Uint8Array`

### Renamed `MirrorConsensusTopicChunk` -> `TopicMessageChunk`

### Renamed `MirrorTopicMessageQuery` -> `TopicMessageQuery`
    * Added `setErrorHandler((Throwable, TopicMessage): void)`
        * This error handler will be called if the max retry count is exceeded, or
        * if the subscribe callback errors out for a specific `TopicMessage`
    * Changed `subscribe(MirrorClient, (MirrorConsensusTopicResponse): void, (Errror): void)` -> `subscribe(Client, (TopicMessage): void): MirrorSubscriptionHandle`
        * Use `setErrorHandler()` instead of passing it in as the third parameter.

### Renamed `ConsensusTopicCreateTransaction` -> `TopicCreateTransaction`
    * Added `topicMemo: string`
    * Added `adminKey: Key`
    * Added `submitKey: Key`
    * Added `autoRenewDuration: Duration`
    * Added `autoRenewAccountId: AccountId`
    * Removed `setAutoRenewAccount(AccountId)`

### Renamed `ConsensusTopicDeleteTransaction` -> `TopicDeleteTransaction`
    * Added `topicId: TopicId`

### Renamed `ConsensusMessageSubmitTransaction` -> `TopicMessageSubmitTransaction`
    * Added `topicId: TopicId`
    * Added `getMessage(): Uint8Array`
    * Added `maxChunks: number`
    * Added `setMaxChunks(number)`

### Renamed `ConsensusTopicId` -> `TopicId`
    * Renamed `topic: number` -> `num: number`

### Renamed `ConsensusTopicInfo` -> `TopicInfo`
    * Added `topicId: TopicId`

### Renamed `ConsensusTopicInfoQuery` -> `TopicInfoQuery`
    * Added `topicId: TopicId`

### Renamed `ConsensusTopicUpdateTransaction` -> `TopicUpdateTransaction`
    * Added `topicId: TopicId`
    * Added `topicMemo: string`
    * Added `adminKey: Key`
    * Added `submitKey: Key`
    * Added `autoRenewDuration: Duration`
    * Added `autoRenewAccountId: AccountId`

### `TokenAssociateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `accountId: AccountId`
    * Added `tokenIds: TokenId[]`
    * Renamed `addTokenId(TokenId)` -> `setTokenIds(TokenId[])`

### `TokenBurnTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `amount: number`

### `TokenCreateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `treasuryAccountId: AccountID`
    * Added `adminKey: Key`
    * Added `kycKey: Key`
    * Added `supplyKey: Key`
    * Added `wipeKey: Key`
    * Added `freezeKey: Key`
    * Added `freezeDefault: boolean`
    * Added `expirationTime: Timestamp`
    * Added `autoRenewAccountId: AccountId`
    * Added `autoRenewPeriod: Duration`
    * Added `decimals: number`
    * Renamed `setName(string)` ->`setTokenName(string)`
    * Renamed `setSymbol(string)` ->`setTokenSymbol(string)`
    * Renamed `setTreasury(AccountId)` ->`setTreasuryAccountId(AccountId)`
    * Renamed `setAutoRenewAccount(AccountId)` ->`setAutoRenewAccountId(AccountId)`

### `TokenDeleteTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`

### `TokenDisassociateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `accountId: AccountId`
    * Added `tokenIds: TokenId[]`
    * Renamed `addTokenId(TokenId)` -> `setTokenIds(TokenId[])`

### `TokenFreezeTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `accountId: AccountId`

### `TokenGrantKycTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `accountId: AccountId`

### `TokenId`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): TokenId`

### `TokenInfo`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): TokenInfo`
    * Renamed `treasury: AccountId` -> `treasuryAccountId: AccountId`
    * Renamed `expiry: Timestamp` -> `expirationTime: Timestamp`

### `TokenInfoQuery` extends [Query](#renamed-querybuilder-query)
    * Added `tokenId: TokenId`

### `TokenMintTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `amount: number`

### `TokenRevokeKycTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `accountId: AccountId`

### Removed `TokenTransferTransaction`
    * Use `TransferTransaction` instead.

### `TokenUnfreezeTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `accountId: AccountId`

### `TokenUpdateTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenName: string`
    * Added `tokenSymbol: string`
    * Added `treasuryAccountId: AccountID`
    * Added `adminKey: Key`
    * Added `kycKey: Key`
    * Added `supplyKey: Key`
    * Added `wipeKey: Key`
    * Added `freezeKey: Key`
    * Added `expirationTime: Timestamp`
    * Added `autoRenewAccountId: AccountId`
    * Added `autoRenewPeriod: Duration`
    * Added `decimals: number`
    * Renamed `setName(string)` ->`setTokenName(string)`
    * Renamed `setSymbol(string)` ->`setTokenSymbol(string)`
    * Renamed `setTreasury(AccountId)` ->`setTreasuryAccountId(AccountId)`
    * Renamed `setAutoRenewAccount(AccountId)` ->`setAutoRenewAccountId(AccountId)`

### `TokenWipeTransaction` extends [Transaction](#combined-transactionbuilder-and-transaction)
    * Added `tokenId: TokenId`
    * Added `accountId: AccountId`
    * Added `amount: Long`

### `FreezeTransaction`
    * Added `startTime: { hour: number; minute: number }`
    * Added `endTime: { hour: number; minute: number }`

### Removed `HbarRangeError`
    * If `Hbar` is out of range `Hedera` will error instead.

### Removed `HederaError`
    * No replacement.

### Removed `TinybarValueError`
    * No replacement.

### Renamed `HederaPrecheckStatusError` -> `PrecheckStatusError`

### Renamed `HederaReceiptStatusError` -> `ReceiptStatusError`

### Removed `HederaRecordStatusError`
    * `ReceiptStatusError` will be thrown instead.

### Removed`HederaStatusError`
    * A `PrecheckStatusError` or `ReceiptStatusError` will be thrown instead.

### Removed `LocalValidationError`
    * No replacement. Local validation is no numberer done.

### Removed `ValidationError`
    * No replacement. Local validation is no numberer done.

### Removed `BadPemFileError`
    * `BadKeyError` will be thrown instead.

### `SystemDeleteTransaction`
    * Added `fileId: FileId`
    * Added `contractId: ContractId`
    * Added `expirationTime: Timestamp`
    * Removed `setId(FileIdLike | ContractIdLike)`

### `SystemUndeleteTransaction`
    * Added `fileId: FileId`
    * Added `contractId: ContractId`
    * Removed `setId(FileIdLike | ContractIdLike)`

### `TransactionId`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): TransactionId`
    * Removed `withValidStart(AccountId, Timestamp): TransactionId`
        * Use `new TransactionId(AccountId, Timestamp)` instead.
    * Removed `TransactionId(AccountId)`
        * Use `generate(AccountId): TransactionId` instead.

### `TransactionReciept`
    * Exposed `exchangeRate: ExchangeRate`
    * Exposed `accountId: AccountId`
    * Exposed `fileId: FileId`
    * Exposed `contractId: ContractId`
    * Exposed `topicId: TopicId`
    * Exposed `tokenId: TokenId`
    * Exposed `topicSequenceNumber: number`
    * Exposed `topicRunningHash: Uint8Array`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): TransactionReceipt`
    * Added `totalSupply: number`
    * Removed `getTopicId(): ConsensusTopicId`
        * Use `topicId: TopicId` directly instead.
    * Removed `getAccountId(): AccountId`
        * Use `accountId: AccountId` directly instead.
    * Removed `getContractId(): ContractId`
        * Use `contractId: ContractId` directly instead.
    * Removed `getFileId(): FileId`
        * Use `fileId: FileId` directly instead.
    * Removed `getTokenId(): TokenId`
        * Use `tokenId: TokenId` directly instead.
    * Removed `getConsensusTopicId(): ConsensusTopicId`
        * Use `topicId: TopicId` directly instead.
    * Removed `getConsensusTopicSequenceNumber(): number`
        * Use `sequenceNumber: number` directly instead.
    * Removed `getConsnsusTopicRunningHash(): Uint8Array`
        * Use `topicRunningHash: Uint8Array` directly instead.

### `TransactionReceiptQuery` extends [Query](#renamed-querybuilder-query)
    * Added `transactionId: TransactionId`

### `TransactionRecord`
    * Added `toBytes(): Uint8Array`
    * Added `fromBytes(Uint8Array): TransactionRecord`
    * Removed `getContratcExecuteResult(): ContractFunctionResult`
        * Use `contractFunctionResult: ContractFunctionResult` directly instead.
    * Removed `getContratcCreateResult(): ContractFunctionResult`
        * Use `contractFunctionResult: ContractFunctionResult` directly instead.

### `TransactionRecordQuery` extends [Query](#renamed-querybuilder-query)
    * Added `transactionId: TransactionId`

### `Hbar`
    * Added `fromString(string): Hbar`
    * Added `fromString(string, HbarUnit): Hbar`
    * Added `from(number, HbarUnit): Hbar`
    * Added `from(BigDecimal, HbarUnit): Hbar`
    * Added `value: BigDecimal`
    * Added `toString(HbarUnit): string`
    * Renamed `fromTinybar(number): Hbar` -> `fromTinybars(number): Hbar`
    * Renamed `of(number): Hbar` -> `from(number): Hbar`
    * Renamed `of(BigDecimal): Hbar` -> `from(BigDecimal): Hbar`
    * Renamed `as(HbarUnit): Hbar` -> `to(HbarUnit): Hbar`
    * Renamed `asTinybar(): number` -> `toTinybars(): number`
    * Renamed `negate(): Hbar` -> `negated(): Hbar`
    * Removed `Hbar.MAX`
    * Removed `Hbar.ZERO`
    * Removed `Hbar.MIN`
    * Removed `zero(): Hbar`
        * Use `new Hbar(0)`
    * Removed `value(): Hbar`
        * Use `toTinybars()` instead.
    * Removed math functions.
        * Use `Hbar.toTinybars()` to get tinybars, do math with the tinybars
          then reconstructor the `Hbar` using `Hbar.fromTinbyars()`

### `Client`
    * Added `setMirrorNetwork(string[]): void`
    * Added `string[] getMirrorNetwork()`
    * Added `forNetwork(Map<AccountId, string>): Client`
    * Added `forName(string): Client`
    * Added `ping(AccountId): void`
    * Added `operatorPublicKey: PublicKey`
    * Added `setNetwork(Map<string, AccountId>): Client`
    * Added `Map<string, AccountId> getNetwork()`
    * Renamed `fromJson(string)` -> `fromConfig(string)`
    * Renamed `fromFile(string)` -> `fromConfigFile(string)`
    * Renamed `getOperatorId(): AccountId` -> `operatorAccountId: AccountId`
    * Changed `setOperatorWith(AccountId, PublicKey, TransactionSigner)`-> `Client setOperatorWith(AccountId, PublicKey, Function<bytes, bytes>): Client`
    * Removed `Client(Map<AccountId, string>)`
    * Removed `replaceNodes(Nodes): Client`
        * Use `setNetwork()` instead.
    * Removed `putNode(AccountIdLike, string)`
        * Use `setNetwork()` instead.

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
