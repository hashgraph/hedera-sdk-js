import { HederaStatusError } from "./errors/HederaStatusError";

interface Indexed {
    [code: number]: Status;
}

export class Status implements Indexed {
    // Index signatures
    [code: number]: Status;

    /**
     * The transaction passed the precheck validations.
     */
    public static readonly Ok = new Status(0);

    /**
     * For any error not handled by specific error codes listed below.
     */
    public static readonly InvalidTransaction = new Status(1);

    /**
     * Payer account does not exist.
     */
    public static readonly PayerAccountNotFound = new Status(2);

    /**
     * Node Account provided does not match the node account of the node the transaction was submitted to.
     */
    public static readonly InvalidNodeAccount = new Status(3);

    /**
     * Pre-Check error when TransactionValidStart + transactionValidDuration is less than current consensus time.
     */
    public static readonly TransactionExpired = new Status(4);

    /**
     * Transaction start time is greater than current consensus time
     */
    public static readonly InvalidTransactionStart = new Status(5);

    /**
     * valid transaction duration is a positive non zero number that does not exceed 120 seconds
     */
    public static readonly InvalidTransactionDuration = new Status(6);

    /**
     * The transaction signature is not valid
     */
    public static readonly InvalidSignature = new Status(7);

    /**
     * Transaction memo size exceeded 100 bytes
     */
    public static readonly MemoTooLong = new Status(8);

    /**
     * The fee provided in the transaction is insufficient for this type of transaction
     */
    public static readonly InsufficientTxFee = new Status(9);

    /**
     * The payer account has insufficient cryptocurrency to pay the transaction fee
     */
    public static readonly InsufficientPayerBalance = new Status(10);

    /**
     * This transaction ID is a duplicate of one that was submitted to this node or reached consensus in the last 180 seconds (receipt period)
     */
    public static readonly DuplicateTransaction = new Status(11);

    /**
     * If API is throttled out
     */
    public static readonly Busy = new Status(12);

    /**
     * The API is not currently supported
     */
    public static readonly NotSupported = new Status(13);

    /**
     * The file id is invalid or does not exist
     */
    public static readonly InvalidFileId = new Status(14);

    /**
     * The account id is invalid or does not exist
     */
    public static readonly InvalidAccountId = new Status(15);

    /**
     * The contract id is invalid or does not exist
     */
    public static readonly InvalidContractId = new Status(16);

    /**
     * Transaction id is not valid
     */
    public static readonly InvalidTransactionId = new Status(17);

    /**
     * Receipt for given transaction id does not exist
     */
    public static readonly ReceiptNotFound = new Status(18);

    /**
     * Record for given transaction id does not exist
     */
    public static readonly RecordNotFound = new Status(19);

    /**
     * The solidity id is invalid or entity with this solidity id does not exist
     */
    public static readonly InvalidSolidityId = new Status(20);

    /**
     * The responding node has submitted the transaction to the network. Its final status is still unknown.
     */
    public static readonly Unknown = new Status(21);

    /**
     * The transaction succeeded
     */
    public static readonly Success = new Status(22);

    /**
     * There was a system error and the transaction failed because of invalid request parameters.
     */
    public static readonly FailInvalid = new Status(23);

    /**
     * There was a system error while performing fee calculation, reserved for future.
     */
    public static readonly FailFee = new Status(24);

    /**
     * There was a system error while performing balance checks, reserved for future.
     */
    public static readonly FailBalance = new Status(25);

    /**
     * Key not provided in the transaction body
     */
    public static readonly KeyRequired = new Status(26);

    /**
     * Unsupported algorithm/encoding used for keys in the transaction
     */
    public static readonly BadEncoding = new Status(27);

    /**
     * When the account balance is not sufficient for the transfer
     */
    public static readonly InsufficientAccountBalance = new Status(28);

    /**
     * During an update transaction when the system is not able to find the Users Solidity address
     */
    public static readonly InvalidSolidityAddress = new Status(29);

    /**
     * Not enough gas was supplied to execute transaction
     */
    public static readonly InsufficientGas = new Status(30);

    /**
     * contract byte code size is over the limit
     */
    public static readonly ContractSizeLimitExceeded = new Status(31);

    /**
     * local execution (query) is requested for a function which changes state
     */
    public static readonly LocalCallModificationException = new Status(32);

    /**
     * Contract REVERT OPCODE executed
     */
    public static readonly ContractRevertExecuted = new Status(33);

    /**
     * For any contract execution related error not handled by specific error codes listed above.
     */
    public static readonly ContractExecutionException = new Status(34);

    /**
     * In Query validation, account with +ve(amount) value should be Receiving node account, the receiver account should be only one account in the list
     */
    public static readonly InvalidReceivingNodeAccount = new Status(35);

    /**
     * Header is missing in Query request
     */
    public static readonly MissingQueryHeader = new Status(36);

    /**
     * The update of the account failed
     */
    public static readonly AccountUpdateFailed = new Status(37);

    /**
     * Provided key encoding was not supported by the system
     */
    public static readonly InvalidKeyEncoding = new Status(38);

    /**
     * null solidity address
     */
    public static readonly NullSolidityAddress = new Status(39);

    /**
     * update of the contract failed
     */
    public static readonly ContractUpdateFailed = new Status(40);

    /**
     * the query header is invalid
     */
    public static readonly InvalidQueryHeader = new Status(41);

    /**
     * Invalid fee submitted
     */
    public static readonly InvalidFeeSubmitted = new Status(42);

    /**
     * Payer signature is invalid
     */
    public static readonly InvalidPayerSignature = new Status(43);

    /**
     * The keys were not provided in the request.
     */
    public static readonly KeyNotProvided = new Status(44);

    /**
     * Expiration time provided in the transaction was invalid.
     */
    public static readonly InvalidExpirationTime = new Status(45);

    /**
     * WriteAccess Control Keys are not provided for the file
     */
    public static readonly NoWaclKey = new Status(46);

    /**
     * The contents of file are provided as empty.
     */
    public static readonly FileContentEmpty = new Status(47);

    /**
     * The crypto transfer credit and debit do not sum equal to 0
     */
    public static readonly InvalidAccountAmounts = new Status(48);

    /**
     * Transaction body provided is empty
     */
    public static readonly EmptyTransactionBody = new Status(49);

    /**
     * Invalid transaction body provided
     */
    public static readonly InvalidTransactionBody = new Status(50);

    /**
     * the type of key (base ed25519 key, KeyList, or ThresholdKey) does not match the type of signature (base ed25519 signature, SignatureList, or ThresholdKeySignature)
     */
    public static readonly InvalidSignatureTypeMismatchingKey = new Status(51);

    /**
     * the number of key (KeyList, or ThresholdKey) does not match that of signature (SignatureList, or ThresholdKeySignature). e.g. if a keyList has 3 base keys, then the corresponding signatureList should also have 3 base signatures.
     */
    public static readonly InvalidSignatureCountMismatchingKey = new Status(52);

    /**
     * the livehash body is empty
     */
    public static readonly EmptyLiveHashBody = new Status(53);

    /**
     * the livehash data is missing
     */
    public static readonly EmptyLiveHash = new Status(54);

    /**
     * the keys for a livehash are missing
     */
    public static readonly EmptyLiveHashKeys = new Status(55);

    /**
     * the livehash data is not the output of a SHA-384 digest
     */
    public static readonly InvalidLiveHashSize = new Status(56);

    /**
     * the query body is empty
     */
    public static readonly EmptyQueryBody = new Status(57);

    /**
     * the crypto livehash query is empty
     */
    public static readonly EmptyLiveHashQuery = new Status(58);

    /**
     * the livehash is not present
     */
    public static readonly LiveHashNotFound = new Status(59);

    /**
     * the account id passed has not yet been created.
     */
    public static readonly AccountIdDoesNotExist = new Status(60);

    /**
     * the livehash already exists for a given account
     */
    public static readonly LiveHashAlreadyExists = new Status(61);

    /**
     * File WACL keys are invalid
     */
    public static readonly InvalidFileWacl = new Status(62);

    /**
     * Serialization failure
     */
    public static readonly SerializationFailed = new Status(63);

    /**
     * The size of the Transaction is greater than transactionMaxBytes
     */
    public static readonly TransactionOversize = new Status(64);

    /**
     * The Transaction has more than 50 levels
     */
    public static readonly TransactionTooManyLayers = new Status(65);

    /**
     * Contract is marked as deleted
     */
    public static readonly ContractDeleted = new Status(66);

    /**
     * the platform node is either disconnected or lagging behind.
     */
    public static readonly PlatformNotActive = new Status(67);

    /**
     * one public key matches more than one prefixes on the signature map
     */
    public static readonly KeyPrefixMismatch = new Status(68);

    /**
     * transaction not created by platform due to large backlog
     */
    public static readonly PlatformTransactionNotCreated = new Status(69);

    /**
     * auto renewal period is not a positive number of seconds
     */
    public static readonly InvalidRenewalPeriod = new Status(70);

    /**
     * the response code when a smart contract id is passed for a crypto API request
     */
    public static readonly InvalidPayerAccountId = new Status(71);

    /**
     * the account has been marked as deleted
     */
    public static readonly AccountDeleted = new Status(72);

    /**
     * the file has been marked as deleted
     */
    public static readonly FileDeleted = new Status(73);

    /**
     * same accounts repeated in the transfer account list
     */
    public static readonly AccountRepeatedInAccountAmounts = new Status(74);

    /**
     * attempting to set negative balance value for crypto account
     */
    public static readonly SettingNegativeAccountBalance = new Status(75);

    /**
     * when deleting smart contract that has crypto balance either transfer account or transfer smart contract is required
     */
    public static readonly ObtainerRequired = new Status(76);

    /**
     * when deleting smart contract that has crypto balance you can not use the same contract id as transferContractId as the one being deleted
     */
    public static readonly ObtainerSameContractId = new Status(77);

    /**
     * transferAccountId or transferContractId specified for contract delete does not exist
     */
    public static readonly ObtainerDoesNotExist = new Status(78);

    /**
     * attempting to modify (update or delete a immutable smart contract, i.e. one created without a admin key)
     */
    public static readonly ModifyingImmutableContract = new Status(79);

    /**
     * Unexpected exception thrown by file system functions
     */
    public static readonly FileSystemException = new Status(80);

    /**
     * the duration is not a subset of [MINIMUM_AUTORENEW_DURATION,MAXIMUM_AUTORENEW_DURATION]
     */
    public static readonly AutorenewDurationNotInRange = new Status(81);

    /**
     * Decoding the smart contract binary to a byte array failed. Check that the input is a valid hex string.
     */
    public static readonly ErrorDecodingBytestring = new Status(82);

    /**
     * File to create a smart contract was of length zero
     */
    public static readonly ContractFileEmpty = new Status(83);

    /**
     * Bytecode for smart contract is of length zero
     */
    public static readonly ContractBytecodeEmpty = new Status(84);

    /**
     * Attempt to set negative initial balance
     */
    public static readonly InvalidInitialBalance = new Status(85);

    /**
     * [Deprecated]. attempt to set negative receive record threshold
     */
    public static readonly InvalidReceiveRecordThreshold = new Status(86);

    /**
     * [Deprecated]. attempt to set negative send record threshold
     */
    public static readonly InvalidSendRecordThreshold = new Status(87);

    /**
     * Special Account Operations should be performed by only Genesis account, return this code if it is not Genesis Account
     */
    public static readonly AccountIsNotGenesisAccount = new Status(88);

    /**
     * The fee payer account doesn't have permission to submit such Transaction
     */
    public static readonly PayerAccountUnauthorized = new Status(89);

    /**
     * FreezeTransactionBody is invalid
     */
    public static readonly InvalidFreezeTransactionBody = new Status(90);

    /**
     * FreezeTransactionBody does not exist
     */
    public static readonly FreezeTransactionBodyNotFound = new Status(91);

    /**
     * Exceeded the number of accounts (both from and to) allowed for crypto transfer list
     */
    public static readonly TransferListSizeLimitExceeded = new Status(92);

    /**
     * Smart contract result size greater than specified maxResultSize
     */
    public static readonly ResultSizeLimitExceeded = new Status(93);

    /**
     * The payer account is not a special account(account 0.0.55)
     */
    public static readonly NotSpecialAccount = new Status(94);

    /**
     * Negative gas was offered in smart contract call
     */
    public static readonly ContractNegativeGas = new Status(95);

    /**
     * Negative value / initial balance was specified in a smart contract call / create
     */
    public static readonly ContractNegativeValue = new Status(96);

    /**
     * Failed to update fee file
     */
    public static readonly InvalidFeeFile = new Status(97);

    /**
     * Failed to update exchange rate file
     */
    public static readonly InvalidExchangeRateFile = new Status(98);

    /**
     * Payment tendered for contract local call cannot cover both the fee and the gas
     */
    public static readonly InsufficientLocalCallGas = new Status(99);

    /**
     * Entities with Entity ID below 1000 are not allowed to be deleted
     */
    public static readonly EntityNotAllowedToDelete = new Status(100);

    /**
     * Violating one of these rules: 1) treasury account can update all entities below 0.0.1000, 2) account 0.0.50 can update all entities from 0.0.51 - 0.0.80, 3) Network Function Master Account A/c 0.0.50 - Update all Network Function accounts & perform all the Network Functions listed below, 4) Network Function Accounts: i) A/c 0.0.55 - Update Address Book files (0.0.101/102), ii) A/c 0.0.56 - Update Fee schedule (0.0.111), iii) A/c 0.0.57 - Update Exchange Rate (0.0.112).
     */
    public static readonly AuthorizationFailed = new Status(101);

    /**
     * Fee Schedule Proto uploaded but not valid (append or update is required)
     */
    public static readonly FileUploadedProtoInvalid = new Status(102);

    /**
     * Fee Schedule Proto uploaded but not valid (append or update is required)
     */
    public static readonly FileUploadedProtoNotSavedToDisk = new Status(103);

    /**
     * Fee Schedule Proto File Part uploaded
     */
    public static readonly FeeScheduleFilePartUploaded = new Status(104);

    /**
     * The change on Exchange Rate exceeds Exchange_Rate_Allowed_Percentage
     */
    public static readonly ExchangeRateChangeLimitExceeded = new Status(105);

    /**
     * Contract permanent storage exceeded the currently allowable limit
     */
    public static readonly MaxContractStorageExceeded = new Status(106);

    /**
     * Transfer Account should not be same as Account to be deleted
     */
    public static readonly TransferAccountSameAsDeleteAccount = new Status(107);

    /**
     *
     */
    public static readonly TotalLedgerBalanceInvalid = new Status(108);

    /**
     * The expiration date/time on a smart contract may not be reduced
     */
    public static readonly ExpirationReductionNotAllowed = new Status(110);

    /**
     * Gas exceeded currently allowable gas limit per transaction
     */
    public static readonly MaxGasLimitExceeded = new Status(111);

    /**
     * File size exceeded the currently allowable limit
     */
    public static readonly MaxFileSizeExceeded = new Status(112);

    /**
     * When a valid signature is not provided for operations on account with receiverSigRequired=true
     */
    public static readonly ReceiverSigRequired = new Status(113);

    /**
     * The Topic ID specified is not in the system.
     */
    public static readonly InvalidTopicId = new Status(150);

    /**
     * A provided admin key was invalid.
     */
    public static readonly InvalidAdminKey = new Status(155);

    /**
     * A provided submit key was invalid.
     */
    public static readonly InvalidSubmitKey = new Status(156);

    /**
     * An attempted operation was not authorized (ie - a deleteTopic for a topic with no adminKey).
     */
    public static readonly Unauthorized = new Status(157);

    /**
     * A ConsensusService message is empty.
     */
    public static readonly InvalidTopicMessage = new Status(158);

    /**
     * The autoRenewAccount specified is not a valid, active account.
     */
    public static readonly InvalidAutorenewAccount = new Status(159);

    /**
     * An adminKey was not specified on the topic, so there must not be an autoRenewAccount.
     */
    public static readonly AutorenewAccountNotAllowed = new Status(160);

    /**
     * The topic has expired, was not automatically renewed, and is in a 7 day grace period before the topic will be deleted unrecoverably. This error response code will not be returned until autoRenew functionality is supported by HAPI.
     */
    public static readonly TopicExpired = new Status(162);

    /**
     * chunk number must be from 1 to total (chunks) inclusive.
     */
    public static readonly InvalidChunkNumber = new Status(163);

    /**
     * For every chunk, the payer account that is part of initialTransactionID must match the Payer Account of this transaction. The entire initialTransactionID should match the transactionID of the first chunk, but this is not checked or enforced by Hedera except when the chunk number is 1.
     */
    public static readonly InvalidChunkTransactionId = new Status(164);

    /**
     * Account is frozen and cannot transact with the token
     */
    public static readonly AccountFrozenForToken = new Status(165);

    /**
     * An involved account already has more than <tt>tokens.maxPerAccount</tt> associations with non-deleted tokens.
     */
    public static readonly TokensPerAccountLimitExceeded = new Status(166);

    /**
     * The token is invalid or does not exist
     */
    public static readonly InvalidTokenId = new Status(167);

    /**
     * Invalid token decimals
     */
    public static readonly InvalidTokenDecimals = new Status(168);

    /**
     * Invalid token initial supply
     */
    public static readonly InvalidTokenInitialSupply = new Status(169);

    /**
     * Treasury Account does not exist or is deleted
     */
    public static readonly InvalidTreasuryAccountForToken = new Status(170);

    /**
     * Token Symbol is not UTF-8 capitalized alphabetical string
     */
    public static readonly InvalidTokenSymbol = new Status(171);

    /**
     * Freeze key is not set on token
     */
    public static readonly TokenHasNoFreezeKey = new Status(172);

    /**
     * Amounts in transfer list are not net zero
     */
    public static readonly TransfersNotZeroSumForToken = new Status(173);

    /**
     * A token symbol was not provided
     */
    public static readonly MissingTokenSymbol = new Status(174);

    /**
     * The provided token symbol was too long
     */
    public static readonly TokenSymbolTooLong = new Status(175);

    /**
     * KYC must be granted and account does not have KYC granted
     */
    public static readonly AccountKycNotGrantedForToken = new Status(176);

    /**
     * KYC key is not set on token
     */
    public static readonly TokenHasNoKycKey = new Status(177);

    /**
     * Token balance is not sufficient for the transaction
     */
    public static readonly InsufficientTokenBalance = new Status(178);

    /**
     * Token transactions cannot be executed on deleted token
     */
    public static readonly TokenWasDeleted = new Status(179);

    /**
     * Supply key is not set on token
     */
    public static readonly TokenHasNoSupplyKey = new Status(180);

    /**
     * Wipe key is not set on token
     */
    public static readonly TokenHasNoWipeKey = new Status(181);

    /**
     * The requested token mint amount would cause an invalid total supply
     */
    public static readonly InvalidTokenMintAmount = new Status(182);

    /**
     * The requested token burn amount would cause an invalid total supply
     */
    public static readonly InvalidTokenBurnAmount = new Status(183);

    /**
     * A required token-account relationship is missing
     */
    public static readonly TokenNotAssociatedToAccount = new Status(184);

    /**
     * The target of a wipe operation was the token treasury account
     */
    public static readonly CannotWipeTokenTreasuryAccount = new Status(185);

    /**
     * The provided KYC key was invalid.
     */
    public static readonly InvalidKycKey = new Status(186);

    /**
     * The provided wipe key was invalid.
     */
    public static readonly InvalidWipeKey = new Status(187);

    /**
     * The provided freeze key was invalid.
     */
    public static readonly InvalidFreezeKey = new Status(188);

    /**
     * The provided supply key was invalid.
     */
    public static readonly InvalidSupplyKey = new Status(189);

    /**
     * Token Name is not provided
     */
    public static readonly MissingTokenName = new Status(190);

    /**
     * Token Name is too long
     */
    public static readonly TokenNameTooLong = new Status(191);

    /**
     * The provided wipe amount must not be negative, zero or bigger than the token holder balance
     */
    public static readonly InvalidWipingAmount = new Status(192);

    /**
     * Token does not have Admin key set, thus update/delete transactions cannot be performed
     */
    public static readonly TokenIsImmutable = new Status(193);

    /**
     * An <tt>associateToken</tt> operation specified a token already associated to the account
     */
    public static readonly TokenAlreadyAssociatedToAccount = new Status(194);

    /**
     * An attempted operation is invalid until all token balances for the target account are zero
     */
    public static readonly TransactionRequiresZeroTokenBalances = new Status(195);

    /**
     * An attempted operation is invalid because the account is a treasury
     */
    public static readonly AccountIsTreasury = new Status(196);

    /**
     * Same TokenIDs present in the token list
     */
    public static readonly TokenIdRepeatedInTokenList = new Status(197);

    /**
     * Exceeded the number of token transfers (both from and to) allowed for token transfer list
     */
    public static readonly TokenTransferListSizeLimitExceeded = new Status(198);

    /**
     * TokenTransfersTransactionBody has no TokenTransferList
     */
    public static readonly EmptyTokenTransferBody = new Status(199);

    /**
     * TokenTransfersTransactionBody has a TokenTransferList with no AccountAmounts
     */
    public static readonly EmptyTokenTransferAccountAmounts = new Status(200);

    /**
     * The Scheduled entity does not exist; or has now expired, been deleted, or been executed
     */
    public static readonly InvalidScheduleId = new Status(201);

    /**
     * The Scheduled entity cannot be modified. Admin key not set
     */
    public static readonly ScheduleIsImmutable = new Status(202);

    /**
     * The provided Scheduled Payer does not exist
     */
    public static readonly InvalidSchedulePayerId = new Status(203);

    /**
     * The Schedule Create Transaction TransactionID account does not exist
     */
    public static readonly InvalidScheduleAccountId = new Status(204);

    /**
     * The provided sig map did not contain any new valid signatures from required signers of the scheduled transaction
     */
    public static readonly NoNewValidSignatures = new Status(205);

    /**
     * The required signers for a scheduled transaction cannot be resolved, for example because they do not exist or have been deleted
     */
    public static readonly UnresolvableRequiredSigners = new Status(206);

    /**
     * Only whitelisted transaction types may be scheduled
     */
    public static readonly ScheduledTransactionNotInWhitelist = new Status(207);

    /**
     * At least one of the signatures in the provided sig map did not represent a valid signature for any required signer
     */
    public static readonly SomeSignaturesWereInvalid = new Status(208);

    /**
     * The scheduled field in the TransactionID may not be set to true
     */
    public static readonly TransactionIdFieldNotAllowed = new Status(209);

    /**
     * A schedule already exists with the same identifying fields of an attempted ScheduleCreate (that is, all fields other than scheduledPayerAccountID)
     */
    public static readonly IdenticalScheduleAlreadyCreated = new Status(210);

    /**
     * A string field in the transaction has a UTF-8 encoding with the prohibited zero byte
     */
    public static readonly InvalidZeroByteInString = new Status(211);

    /**
     * A schedule being signed or deleted has already been deleted
     */
    public static readonly ScheduleAlreadyDeleted = new Status(212);

    /**
     * A schedule being signed or deleted has already been executed
     */
    public static readonly ScheduleAlreadyExecuted = new Status(213);

    /**
     * ConsensusSubmitMessage request's message size is larger than allowed.
     */
    public static readonly MessageSizeTooLarge = new Status(214);

    /**
     * An operation was assigned to more than one throttle group in a given bucket
     */
    public static readonly OperationRepeatedInBucketGroups = new Status(215);

    /**
     * The capacity needed to satisfy all opsPerSec groups in a bucket overflowed a signed 8-byte integral type
     */
    public static readonly BucketCapacityOverflow = new Status(216);

    /**
     * Given the network size in the address book, the node-level capacity for an operation would never be enough to accept a single request; usually means a bucket burstPeriod should be increased
     */
    public static readonly NodeCapacityNotSufficientForOperation = new Status(217);

    /**
     * A bucket was defined without any throttle groups
     */
    public static readonly BucketHasNoThrottleGroups = new Status(218);

    /**
     * A throttle group was granted zero opsPerSec
     */
    public static readonly ThrottleGroupHasZeroOpsPerSec = new Status(219);

    /**
     * The throttle definitions file was updated, but some supported operations were not assigned a bucket
     */
    public static readonly SuccessButMissingExpectedOperation = new Status(220);

    /**
     * The new contents for the throttle definitions system file were not valid protobuf
     */
    public static readonly UnparseableThrottleDefinitions = new Status(221);

    /**
     * The new throttle definitions system file were invalid, and no more specific error could be divined
     */
    public static readonly InvalidThrottleDefinitions = new Status(222);

    /**
     * The transaction references an account which has passed its expiration without renewal funds available, and currently remains in the ledger only because of the grace period given to expired entities
     */
    public static readonly AccountExpiredAndPendingRemoval = new Status(223);

    /**
     * Invalid token max supply
     */
    public static readonly InvalidTokenMaxSupply = new Status(224);

    /**
     * Invalid token nft serial number
     */
    public static readonly InvalidTokenNftSerialNumber = new Status(225);

    /**
     * Invalid nft id
     */
    public static readonly InvalidNftId = new Status(226);

    /**
     * Nft metadata is too long
     */
    public static readonly MetadataTooLong = new Status(227);

    /**
     * Repeated operations count exceeds the limit
     */
    public static readonly BatchSizeLimitExceeded = new Status(228);

    /**
     * The range of data to be gathered is out of the set boundaries
     */
    public static readonly InvalidQueryRange = new Status(229);

    /**
     * A custom fractional fee set a denominator of zero
     */
    public static readonly FractionDividesByZero = new Status(230);

    /**
     * The transaction payer could not afford a custom fee
     */
    public static readonly InsufficientPayerBalanceForCustomFee = new Status(231);

    /**
     * The customFees list is longer than allowed limit 10
     */
    public static readonly CustomFeesListTooLong = new Status(232);

    /**
     * Any of the feeCollector accounts for customFees is invalid
     */
    public static readonly InvalidCustomFeeCollector = new Status(233);

    /**
     * Any of the token Ids in customFees is invalid
     */
    public static readonly InvalidTokenIdInCustomFees = new Status(234);

    /**
     * Any of the token Ids in customFees are not associated to feeCollector
     */
    public static readonly TokenNotAssociatedToFeeCollector = new Status(235);

    /**
     * A token cannot have more units minted due to its configured supply ceiling
     */
    public static readonly TokenMaxSupplyReached = new Status(236);

    /**
     * The transaction attempted to move an NFT serial number from an account other than its owner
     */
    public static readonly SenderDoesNotOwnNftSerialNo = new Status(237);

    /**
     * A custom fee schedule entry did not specify either a fixed or fractional fee
     */
    public static readonly CustomFeeNotFullySpecified = new Status(238);

    /**
     * Only positive fees may be assessed at this time
     */
    public static readonly CustomFeeMustBePositive = new Status(239);

    /**
     * Fee schedule key is not set on token
     */
    public static readonly TokenHasNoFeeScheduleKey = new Status(240);

    /**
     * A fractional custom fee exceeded the range of a 64-bit signed integer
     */
    public static readonly CustomFeeOutsideNumericRange = new Status(241);

    /**
     * The sum of all custom fractional fees must be strictly less than 1
     */
    public static readonly InvalidCustomFractionalFeesSum = new Status(242);

    /**
     * Each fractional custom fee must have its maximum_amount, if specified, at least its minimum_amount
     */
    public static readonly FractionalFeeMaxAmountLessThanMinAmount = new Status(243);

    /**
     * A fee schedule update tried to clear the custom fees from a token whose fee schedule was already empty
     */
    public static readonly CustomScheduleAlreadyHasNoFees = new Status(244);

    /**
     * Only tokens of type FUNGIBLE_COMMON can be used to as fee schedule denominations
     */
    public static readonly CustomFeeDenominationMustBeFungibleCommon = new Status(245);

    /**
     * Only tokens of type FUNGIBLE_COMMON can have fractional fees
     */
    public static readonly CustomFractionalFeeOnlyAllowedForFungibleCommon = new Status(246);

    /**
     * The provided custom fee schedule key was invalid
     */
    public static readonly InvalidCustomFeeScheduleKey = new Status(247);

    /**
     * The requested token mint metadata was invalid
     */
    public static readonly InvalidTokenMintMetadata = new Status(248);

    /**
     * The requested token burn metadata was invalid
     */
    public static readonly InvalidTokenBurnMetadata = new Status(249);

    /**
     * The treasury for a unique token cannot be changed until it owns no NFTs
     */
    public static readonly CurrentTreasuryStillOwnsNfts = new Status(250);

    private static [ 0 ] = Status.Ok;
    private static [ 1 ] = Status.InvalidTransaction;
    private static [ 2 ] = Status.PayerAccountNotFound;
    private static [ 3 ] = Status.InvalidNodeAccount;
    private static [ 4 ] = Status.TransactionExpired;
    private static [ 5 ] = Status.InvalidTransactionStart;
    private static [ 6 ] = Status.InvalidTransactionDuration;
    private static [ 7 ] = Status.InvalidSignature;
    private static [ 8 ] = Status.MemoTooLong;
    private static [ 9 ] = Status.InsufficientTxFee;
    private static [ 10 ] = Status.InsufficientPayerBalance;
    private static [ 11 ] = Status.DuplicateTransaction;
    private static [ 12 ] = Status.Busy;
    private static [ 13 ] = Status.NotSupported;
    private static [ 14 ] = Status.InvalidFileId;
    private static [ 15 ] = Status.InvalidAccountId;
    private static [ 16 ] = Status.InvalidContractId;
    private static [ 17 ] = Status.InvalidTransactionId;
    private static [ 18 ] = Status.ReceiptNotFound;
    private static [ 19 ] = Status.RecordNotFound;
    private static [ 20 ] = Status.InvalidSolidityId;
    private static [ 21 ] = Status.Unknown;
    private static [ 22 ] = Status.Success;
    private static [ 23 ] = Status.FailInvalid;
    private static [ 24 ] = Status.FailFee;
    private static [ 25 ] = Status.FailBalance;
    private static [ 26 ] = Status.KeyRequired;
    private static [ 27 ] = Status.BadEncoding;
    private static [ 28 ] = Status.InsufficientAccountBalance;
    private static [ 29 ] = Status.InvalidSolidityAddress;
    private static [ 30 ] = Status.InsufficientGas;
    private static [ 31 ] = Status.ContractSizeLimitExceeded;
    private static [ 32 ] = Status.LocalCallModificationException;
    private static [ 33 ] = Status.ContractRevertExecuted;
    private static [ 34 ] = Status.ContractExecutionException;
    private static [ 35 ] = Status.InvalidReceivingNodeAccount;
    private static [ 36 ] = Status.MissingQueryHeader;
    private static [ 37 ] = Status.AccountUpdateFailed;
    private static [ 38 ] = Status.InvalidKeyEncoding;
    private static [ 39 ] = Status.NullSolidityAddress;
    private static [ 40 ] = Status.ContractUpdateFailed;
    private static [ 41 ] = Status.InvalidQueryHeader;
    private static [ 42 ] = Status.InvalidFeeSubmitted;
    private static [ 43 ] = Status.InvalidPayerSignature;
    private static [ 44 ] = Status.KeyNotProvided;
    private static [ 45 ] = Status.InvalidExpirationTime;
    private static [ 46 ] = Status.NoWaclKey;
    private static [ 47 ] = Status.FileContentEmpty;
    private static [ 48 ] = Status.InvalidAccountAmounts;
    private static [ 49 ] = Status.EmptyTransactionBody;
    private static [ 50 ] = Status.InvalidTransactionBody;
    private static [ 51 ] = Status.InvalidSignatureTypeMismatchingKey;
    private static [ 52 ] = Status.InvalidSignatureCountMismatchingKey;
    private static [ 53 ] = Status.EmptyLiveHashBody;
    private static [ 54 ] = Status.EmptyLiveHash;
    private static [ 55 ] = Status.EmptyLiveHashKeys;
    private static [ 56 ] = Status.InvalidLiveHashSize;
    private static [ 57 ] = Status.EmptyQueryBody;
    private static [ 58 ] = Status.EmptyLiveHashQuery;
    private static [ 59 ] = Status.LiveHashNotFound;
    private static [ 60 ] = Status.AccountIdDoesNotExist;
    private static [ 61 ] = Status.LiveHashAlreadyExists;
    private static [ 62 ] = Status.InvalidFileWacl;
    private static [ 63 ] = Status.SerializationFailed;
    private static [ 64 ] = Status.TransactionOversize;
    private static [ 65 ] = Status.TransactionTooManyLayers;
    private static [ 66 ] = Status.ContractDeleted;
    private static [ 67 ] = Status.PlatformNotActive;
    private static [ 68 ] = Status.KeyPrefixMismatch;
    private static [ 69 ] = Status.PlatformTransactionNotCreated;
    private static [ 70 ] = Status.InvalidRenewalPeriod;
    private static [ 71 ] = Status.InvalidPayerAccountId;
    private static [ 72 ] = Status.AccountDeleted;
    private static [ 73 ] = Status.FileDeleted;
    private static [ 74 ] = Status.AccountRepeatedInAccountAmounts;
    private static [ 75 ] = Status.SettingNegativeAccountBalance;
    private static [ 76 ] = Status.ObtainerRequired;
    private static [ 77 ] = Status.ObtainerSameContractId;
    private static [ 78 ] = Status.ObtainerDoesNotExist;
    private static [ 79 ] = Status.ModifyingImmutableContract;
    private static [ 80 ] = Status.FileSystemException;
    private static [ 81 ] = Status.AutorenewDurationNotInRange;
    private static [ 82 ] = Status.ErrorDecodingBytestring;
    private static [ 83 ] = Status.ContractFileEmpty;
    private static [ 84 ] = Status.ContractBytecodeEmpty;
    private static [ 85 ] = Status.InvalidInitialBalance;
    private static [ 86 ] = Status.InvalidReceiveRecordThreshold;
    private static [ 87 ] = Status.InvalidSendRecordThreshold;
    private static [ 88 ] = Status.AccountIsNotGenesisAccount;
    private static [ 89 ] = Status.PayerAccountUnauthorized;
    private static [ 90 ] = Status.InvalidFreezeTransactionBody;
    private static [ 91 ] = Status.FreezeTransactionBodyNotFound;
    private static [ 92 ] = Status.TransferListSizeLimitExceeded;
    private static [ 93 ] = Status.ResultSizeLimitExceeded;
    private static [ 94 ] = Status.NotSpecialAccount;
    private static [ 95 ] = Status.ContractNegativeGas;
    private static [ 96 ] = Status.ContractNegativeValue;
    private static [ 97 ] = Status.InvalidFeeFile;
    private static [ 98 ] = Status.InvalidExchangeRateFile;
    private static [ 99 ] = Status.InsufficientLocalCallGas;
    private static [ 100 ] = Status.EntityNotAllowedToDelete;
    private static [ 101 ] = Status.AuthorizationFailed;
    private static [ 102 ] = Status.FileUploadedProtoInvalid;
    private static [ 103 ] = Status.FileUploadedProtoNotSavedToDisk;
    private static [ 104 ] = Status.FeeScheduleFilePartUploaded;
    private static [ 105 ] = Status.ExchangeRateChangeLimitExceeded;
    private static [ 106 ] = Status.MaxContractStorageExceeded;
    private static [ 107 ] = Status.TransferAccountSameAsDeleteAccount;
    private static [ 108 ] = Status.TotalLedgerBalanceInvalid;
    private static [ 110 ] = Status.ExpirationReductionNotAllowed;
    private static [ 111 ] = Status.MaxGasLimitExceeded;
    private static [ 112 ] = Status.MaxFileSizeExceeded;
    private static [ 113 ] = Status.ReceiverSigRequired;
    private static [ 150 ] = Status.InvalidTopicId;
    private static [ 155 ] = Status.InvalidAdminKey;
    private static [ 156 ] = Status.InvalidSubmitKey;
    private static [ 157 ] = Status.Unauthorized;
    private static [ 158 ] = Status.InvalidTopicMessage;
    private static [ 159 ] = Status.InvalidAutorenewAccount;
    private static [ 160 ] = Status.AutorenewAccountNotAllowed;
    private static [ 162 ] = Status.TopicExpired;
    private static [ 163 ] = Status.InvalidChunkNumber;
    private static [ 164 ] = Status.InvalidChunkTransactionId;
    private static [ 165 ] = Status.AccountFrozenForToken;
    private static [ 166 ] = Status.TokensPerAccountLimitExceeded;
    private static [ 167 ] = Status.InvalidTokenId;
    private static [ 168 ] = Status.InvalidTokenDecimals;
    private static [ 169 ] = Status.InvalidTokenInitialSupply;
    private static [ 170 ] = Status.InvalidTreasuryAccountForToken;
    private static [ 171 ] = Status.InvalidTokenSymbol;
    private static [ 172 ] = Status.TokenHasNoFreezeKey;
    private static [ 173 ] = Status.TransfersNotZeroSumForToken;
    private static [ 174 ] = Status.MissingTokenSymbol;
    private static [ 175 ] = Status.TokenSymbolTooLong;
    private static [ 176 ] = Status.AccountKycNotGrantedForToken;
    private static [ 177 ] = Status.TokenHasNoKycKey;
    private static [ 178 ] = Status.InsufficientTokenBalance;
    private static [ 179 ] = Status.TokenWasDeleted;
    private static [ 180 ] = Status.TokenHasNoSupplyKey;
    private static [ 181 ] = Status.TokenHasNoWipeKey;
    private static [ 182 ] = Status.InvalidTokenMintAmount;
    private static [ 183 ] = Status.InvalidTokenBurnAmount;
    private static [ 184 ] = Status.TokenNotAssociatedToAccount;
    private static [ 185 ] = Status.CannotWipeTokenTreasuryAccount;
    private static [ 186 ] = Status.InvalidKycKey;
    private static [ 187 ] = Status.InvalidWipeKey;
    private static [ 188 ] = Status.InvalidFreezeKey;
    private static [ 189 ] = Status.InvalidSupplyKey;
    private static [ 190 ] = Status.MissingTokenName;
    private static [ 191 ] = Status.TokenNameTooLong;
    private static [ 192 ] = Status.InvalidWipingAmount;
    private static [ 193 ] = Status.TokenIsImmutable;
    private static [ 194 ] = Status.TokenAlreadyAssociatedToAccount;
    private static [ 195 ] = Status.TransactionRequiresZeroTokenBalances;
    private static [ 196 ] = Status.AccountIsTreasury;
    private static [ 197 ] = Status.TokenIdRepeatedInTokenList;
    private static [ 198 ] = Status.TokenTransferListSizeLimitExceeded;
    private static [ 199 ] = Status.EmptyTokenTransferBody;
    private static [ 200 ] = Status.EmptyTokenTransferAccountAmounts;
    private static [ 201 ] = Status.InvalidScheduleId;
    private static [ 202 ] = Status.ScheduleIsImmutable;
    private static [ 203 ] = Status.InvalidSchedulePayerId;
    private static [ 204 ] = Status.InvalidScheduleAccountId;
    private static [ 205 ] = Status.NoNewValidSignatures;
    private static [ 206 ] = Status.UnresolvableRequiredSigners;
    private static [ 207 ] = Status.ScheduledTransactionNotInWhitelist;
    private static [ 208 ] = Status.SomeSignaturesWereInvalid;
    private static [ 209 ] = Status.TransactionIdFieldNotAllowed;
    private static [ 210 ] = Status.IdenticalScheduleAlreadyCreated;
    private static [ 211 ] = Status.InvalidZeroByteInString;
    private static [ 212 ] = Status.ScheduleAlreadyDeleted;
    private static [ 213 ] = Status.ScheduleAlreadyExecuted;
    private static [ 214 ] = Status.MessageSizeTooLarge;
    private static [ 215 ] = Status.OperationRepeatedInBucketGroups;
    private static [ 216 ] = Status.BucketCapacityOverflow;
    private static [ 217 ] = Status.NodeCapacityNotSufficientForOperation;
    private static [ 218 ] = Status.BucketHasNoThrottleGroups;
    private static [ 219 ] = Status.ThrottleGroupHasZeroOpsPerSec;
    private static [ 220 ] = Status.SuccessButMissingExpectedOperation;
    private static [ 221 ] = Status.UnparseableThrottleDefinitions;
    private static [ 222 ] = Status.InvalidThrottleDefinitions;
    private static [ 223 ] = Status.AccountExpiredAndPendingRemoval;
    private static [ 224 ] = Status.InvalidTokenMaxSupply;
    private static [ 225 ] = Status.InvalidTokenNftSerialNumber;
    private static [ 226 ] = Status.InvalidNftId;
    private static [ 227 ] = Status.MetadataTooLong;
    private static [ 228 ] = Status.BatchSizeLimitExceeded;
    private static [ 229 ] = Status.InvalidQueryRange;
    private static [ 230 ] = Status.FractionDividesByZero;
    private static [ 231 ] = Status.InsufficientPayerBalanceForCustomFee;
    private static [ 232 ] = Status.CustomFeesListTooLong;
    private static [ 233 ] = Status.InvalidCustomFeeCollector;
    private static [ 234 ] = Status.InvalidTokenIdInCustomFees;
    private static [ 235 ] = Status.TokenNotAssociatedToFeeCollector;
    private static [ 236 ] = Status.TokenMaxSupplyReached;
    private static [ 237 ] = Status.SenderDoesNotOwnNftSerialNo;
    private static [ 238 ] = Status.CustomFeeNotFullySpecified;
    private static [ 239 ] = Status.CustomFeeMustBePositive;
    private static [ 240 ] = Status.TokenHasNoFeeScheduleKey;
    private static [ 241 ] = Status.CustomFeeOutsideNumericRange;
    private static [ 242 ] = Status.InvalidCustomFractionalFeesSum;
    private static [ 243 ] = Status.FractionalFeeMaxAmountLessThanMinAmount;
    private static [ 244 ] = Status.CustomScheduleAlreadyHasNoFees;
    private static [ 245 ] = Status.CustomFeeDenominationMustBeFungibleCommon;
    private static [ 246 ] = Status.CustomFractionalFeeOnlyAllowedForFungibleCommon;
    private static [ 247 ] = Status.InvalidCustomFeeScheduleKey;
    private static [ 248 ] = Status.InvalidTokenMintMetadata;
    private static [ 249 ] = Status.InvalidTokenBurnMetadata;
    private static [ 250 ] = Status.CurrentTreasuryStillOwnsNfts;

    // New functionality added by HTS above

    public readonly code: number;

    // NOT A STABLE API
    public constructor(code: number) {
        this.code = code;
    }

    public toString(): string {
        switch (this) {
            case Status.Ok: return "OK";
            case Status.InvalidTransaction: return "INVALID_TRANSACTION";
            case Status.PayerAccountNotFound: return "PAYER_ACCOUNT_NOT_FOUND";
            case Status.InvalidNodeAccount: return "INVALID_NODE_ACCOUNT";
            case Status.TransactionExpired: return "TRANSACTION_EXPIRED";
            case Status.InvalidTransactionStart: return "INVALID_TRANSACTION_START";
            case Status.InvalidTransactionDuration: return "INVALID_TRANSACTION_DURATION";
            case Status.InvalidSignature: return "INVALID_SIGNATURE";
            case Status.MemoTooLong: return "MEMO_TOO_LONG";
            case Status.InsufficientTxFee: return "INSUFFICIENT_TX_FEE";
            case Status.InsufficientPayerBalance: return "INSUFFICIENT_PAYER_BALANCE";
            case Status.DuplicateTransaction: return "DUPLICATE_TRANSACTION";
            case Status.Busy: return "BUSY";
            case Status.NotSupported: return "NOT_SUPPORTED";
            case Status.InvalidFileId: return "INVALID_FILE_ID";
            case Status.InvalidAccountId: return "INVALID_ACCOUNT_ID";
            case Status.InvalidContractId: return "INVALID_CONTRACT_ID";
            case Status.InvalidTransactionId: return "INVALID_TRANSACTION_ID";
            case Status.ReceiptNotFound: return "RECEIPT_NOT_FOUND";
            case Status.RecordNotFound: return "RECORD_NOT_FOUND";
            case Status.InvalidSolidityId: return "INVALID_SOLIDITY_ID";
            case Status.Unknown: return "UNKNOWN";
            case Status.Success: return "SUCCESS";
            case Status.FailInvalid: return "FAIL_INVALID";
            case Status.FailFee: return "FAIL_FEE";
            case Status.FailBalance: return "FAIL_BALANCE";
            case Status.KeyRequired: return "KEY_REQUIRED";
            case Status.BadEncoding: return "BAD_ENCODING";
            case Status.InsufficientAccountBalance: return "INSUFFICIENT_ACCOUNT_BALANCE";
            case Status.InvalidSolidityAddress: return "INVALID_SOLIDITY_ADDRESS";
            case Status.InsufficientGas: return "INSUFFICIENT_GAS";
            case Status.ContractSizeLimitExceeded: return "CONTRACT_SIZE_LIMIT_EXCEEDED";
            case Status.LocalCallModificationException: return "LOCAL_CALL_MODIFICATION_EXCEPTION";
            case Status.ContractRevertExecuted: return "CONTRACT_REVERT_EXECUTED";
            case Status.ContractExecutionException: return "CONTRACT_EXECUTION_EXCEPTION";
            case Status.InvalidReceivingNodeAccount: return "INVALID_RECEIVING_NODE_ACCOUNT";
            case Status.MissingQueryHeader: return "MISSING_QUERY_HEADER";
            case Status.AccountUpdateFailed: return "ACCOUNT_UPDATE_FAILED";
            case Status.InvalidKeyEncoding: return "INVALID_KEY_ENCODING";
            case Status.NullSolidityAddress: return "NULL_SOLIDITY_ADDRESS";
            case Status.ContractUpdateFailed: return "CONTRACT_UPDATE_FAILED";
            case Status.InvalidQueryHeader: return "INVALID_QUERY_HEADER";
            case Status.InvalidFeeSubmitted: return "INVALID_FEE_SUBMITTED";
            case Status.InvalidPayerSignature: return "INVALID_PAYER_SIGNATURE";
            case Status.KeyNotProvided: return "KEY_NOT_PROVIDED";
            case Status.InvalidExpirationTime: return "INVALID_EXPIRATION_TIME";
            case Status.NoWaclKey: return "NO_WACL_KEY";
            case Status.FileContentEmpty: return "FILE_CONTENT_EMPTY";
            case Status.InvalidAccountAmounts: return "INVALID_ACCOUNT_AMOUNTS";
            case Status.EmptyTransactionBody: return "EMPTY_TRANSACTION_BODY";
            case Status.InvalidTransactionBody: return "INVALID_TRANSACTION_BODY";
            case Status.InvalidSignatureTypeMismatchingKey: return "INVALID_SIGNATURE_TYPE_MISMATCHING_KEY";
            case Status.InvalidSignatureCountMismatchingKey: return "INVALID_SIGNATURE_COUNT_MISMATCHING_KEY";
            case Status.EmptyLiveHashBody: return "EMPTY_LIVE_HASH_BODY";
            case Status.EmptyLiveHash: return "EMPTY_LIVE_HASH";
            case Status.EmptyLiveHashKeys: return "EMPTY_LIVE_HASH_KEYS";
            case Status.InvalidLiveHashSize: return "INVALID_LIVE_HASH_SIZE";
            case Status.EmptyQueryBody: return "EMPTY_QUERY_BODY";
            case Status.EmptyLiveHashQuery: return "EMPTY_LIVE_HASH_QUERY";
            case Status.LiveHashNotFound: return "LIVE_HASH_NOT_FOUND";
            case Status.AccountIdDoesNotExist: return "ACCOUNT_ID_DOES_NOT_EXIST";
            case Status.LiveHashAlreadyExists: return "LIVE_HASH_ALREADY_EXISTS";
            case Status.InvalidFileWacl: return "INVALID_FILE_WACL";
            case Status.SerializationFailed: return "SERIALIZATION_FAILED";
            case Status.TransactionOversize: return "TRANSACTION_OVERSIZE";
            case Status.TransactionTooManyLayers: return "TRANSACTION_TOO_MANY_LAYERS";
            case Status.ContractDeleted: return "CONTRACT_DELETED";
            case Status.PlatformNotActive: return "PLATFORM_NOT_ACTIVE";
            case Status.KeyPrefixMismatch: return "KEY_PREFIX_MISMATCH";
            case Status.PlatformTransactionNotCreated: return "PLATFORM_TRANSACTION_NOT_CREATED";
            case Status.InvalidRenewalPeriod: return "INVALID_RENEWAL_PERIOD";
            case Status.InvalidPayerAccountId: return "INVALID_PAYER_ACCOUNT_ID";
            case Status.AccountDeleted: return "ACCOUNT_DELETED";
            case Status.FileDeleted: return "FILE_DELETED";
            case Status.AccountRepeatedInAccountAmounts: return "ACCOUNT_REPEATED_IN_ACCOUNT_AMOUNTS";
            case Status.SettingNegativeAccountBalance: return "SETTING_NEGATIVE_ACCOUNT_BALANCE";
            case Status.ObtainerRequired: return "OBTAINER_REQUIRED";
            case Status.ObtainerSameContractId: return "OBTAINER_SAME_CONTRACT_ID";
            case Status.ObtainerDoesNotExist: return "OBTAINER_DOES_NOT_EXIST";
            case Status.ModifyingImmutableContract: return "MODIFYING_IMMUTABLE_CONTRACT";
            case Status.FileSystemException: return "FILE_SYSTEM_EXCEPTION";
            case Status.AutorenewDurationNotInRange: return "AUTORENEW_DURATION_NOT_IN_RANGE";
            case Status.ErrorDecodingBytestring: return "ERROR_DECODING_BYTESTRING";
            case Status.ContractFileEmpty: return "CONTRACT_FILE_EMPTY";
            case Status.ContractBytecodeEmpty: return "CONTRACT_BYTECODE_EMPTY";
            case Status.InvalidInitialBalance: return "INVALID_INITIAL_BALANCE";
            case Status.InvalidReceiveRecordThreshold: return "INVALID_RECEIVE_RECORD_THRESHOLD";
            case Status.InvalidSendRecordThreshold: return "INVALID_SEND_RECORD_THRESHOLD";
            case Status.AccountIsNotGenesisAccount: return "ACCOUNT_IS_NOT_GENESIS_ACCOUNT";
            case Status.PayerAccountUnauthorized: return "PAYER_ACCOUNT_UNAUTHORIZED";
            case Status.InvalidFreezeTransactionBody: return "INVALID_FREEZE_TRANSACTION_BODY";
            case Status.FreezeTransactionBodyNotFound: return "FREEZE_TRANSACTION_BODY_NOT_FOUND";
            case Status.TransferListSizeLimitExceeded: return "TRANSFER_LIST_SIZE_LIMIT_EXCEEDED";
            case Status.ResultSizeLimitExceeded: return "RESULT_SIZE_LIMIT_EXCEEDED";
            case Status.NotSpecialAccount: return "NOT_SPECIAL_ACCOUNT";
            case Status.ContractNegativeGas: return "CONTRACT_NEGATIVE_GAS";
            case Status.ContractNegativeValue: return "CONTRACT_NEGATIVE_VALUE";
            case Status.InvalidFeeFile: return "INVALID_FEE_FILE";
            case Status.InvalidExchangeRateFile: return "INVALID_EXCHANGE_RATE_FILE";
            case Status.InsufficientLocalCallGas: return "INSUFFICIENT_LOCAL_CALL_GAS";
            case Status.EntityNotAllowedToDelete: return "ENTITY_NOT_ALLOWED_TO_DELETE";
            case Status.AuthorizationFailed: return "AUTHORIZATION_FAILED";
            case Status.FileUploadedProtoInvalid: return "FILE_UPLOADED_PROTO_INVALID";
            case Status.FileUploadedProtoNotSavedToDisk: return "FILE_UPLOADED_PROTO_NOT_SAVED_TO_DISK";
            case Status.FeeScheduleFilePartUploaded: return "FEE_SCHEDULE_FILE_PART_UPLOADED";
            case Status.ExchangeRateChangeLimitExceeded: return "EXCHANGE_RATE_CHANGE_LIMIT_EXCEEDED";
            case Status.MaxContractStorageExceeded: return "MAX_CONTRACT_STORAGE_EXCEEDED";
            case Status.TransferAccountSameAsDeleteAccount: return "TRANSFER_ACCOUNT_SAME_AS_DELETE_ACCOUNT";
            case Status.TotalLedgerBalanceInvalid: return "TOTAL_LEDGER_BALANCE_INVALID";
            case Status.ExpirationReductionNotAllowed: return "EXPIRATION_REDUCTION_NOT_ALLOWED";
            case Status.MaxGasLimitExceeded: return "MAX_GAS_LIMIT_EXCEEDED";
            case Status.MaxFileSizeExceeded: return "MAX_FILE_SIZE_EXCEEDED";
            case Status.ReceiverSigRequired: return "RECEIVER_SIG_REQUIRED";
            case Status.InvalidTopicId: return "INVALID_TOPIC_ID";
            case Status.InvalidAdminKey: return "INVALID_ADMIN_KEY";
            case Status.InvalidSubmitKey: return "INVALID_SUBMIT_KEY";
            case Status.Unauthorized: return "UNAUTHORIZED";
            case Status.InvalidTopicMessage: return "INVALID_TOPIC_MESSAGE";
            case Status.InvalidAutorenewAccount: return "INVALID_AUTORENEW_ACCOUNT";
            case Status.AutorenewAccountNotAllowed: return "AUTORENEW_ACCOUNT_NOT_ALLOWED";
            case Status.TopicExpired: return "TOPIC_EXPIRED";
            case Status.InvalidChunkNumber: return "INVALID_CHUNK_NUMBER";
            case Status.InvalidChunkTransactionId: return "INVALID_CHUNK_TRANSACTION_ID";
            case Status.AccountFrozenForToken: return "ACCOUNT_FROZEN_FOR_TOKEN";
            case Status.TokensPerAccountLimitExceeded: return "TOKENS_PER_ACCOUNT_LIMIT_EXCEEDED";
            case Status.InvalidTokenId: return "INVALID_TOKEN_ID";
            case Status.InvalidTokenDecimals: return "INVALID_TOKEN_DECIMALS";
            case Status.InvalidTokenInitialSupply: return "INVALID_TOKEN_INITIAL_SUPPLY";
            case Status.InvalidTreasuryAccountForToken: return "INVALID_TREASURY_ACCOUNT_FOR_TOKEN";
            case Status.InvalidTokenSymbol: return "INVALID_TOKEN_SYMBOL";
            case Status.TokenHasNoFreezeKey: return "TOKEN_HAS_NO_FREEZE_KEY";
            case Status.TransfersNotZeroSumForToken: return "TRANSFERS_NOT_ZERO_SUM_FOR_TOKEN";
            case Status.MissingTokenSymbol: return "MISSING_TOKEN_SYMBOL";
            case Status.TokenSymbolTooLong: return "TOKEN_SYMBOL_TOO_LONG";
            case Status.AccountKycNotGrantedForToken: return "ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN";
            case Status.TokenHasNoKycKey: return "TOKEN_HAS_NO_KYC_KEY";
            case Status.InsufficientTokenBalance: return "INSUFFICIENT_TOKEN_BALANCE";
            case Status.TokenWasDeleted: return "TOKEN_WAS_DELETED";
            case Status.TokenHasNoSupplyKey: return "TOKEN_HAS_NO_SUPPLY_KEY";
            case Status.TokenHasNoWipeKey: return "TOKEN_HAS_NO_WIPE_KEY";
            case Status.InvalidTokenMintAmount: return "INVALID_TOKEN_MINT_AMOUNT";
            case Status.InvalidTokenBurnAmount: return "INVALID_TOKEN_BURN_AMOUNT";
            case Status.TokenNotAssociatedToAccount: return "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT";
            case Status.CannotWipeTokenTreasuryAccount: return "CANNOT_WIPE_TOKEN_TREASURY_ACCOUNT";
            case Status.InvalidKycKey: return "INVALID_KYC_KEY";
            case Status.InvalidWipeKey: return "INVALID_WIPE_KEY";
            case Status.InvalidFreezeKey: return "INVALID_FREEZE_KEY";
            case Status.InvalidSupplyKey: return "INVALID_SUPPLY_KEY";
            case Status.MissingTokenName: return "MISSING_TOKEN_NAME";
            case Status.TokenNameTooLong: return "TOKEN_NAME_TOO_LONG";
            case Status.InvalidWipingAmount: return "INVALID_WIPING_AMOUNT";
            case Status.TokenIsImmutable: return "TOKEN_IS_IMMUTABLE";
            case Status.TokenAlreadyAssociatedToAccount: return "TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT";
            case Status.TransactionRequiresZeroTokenBalances: return "TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES";
            case Status.AccountIsTreasury: return "ACCOUNT_IS_TREASURY";
            case Status.TokenIdRepeatedInTokenList: return "TOKEN_ID_REPEATED_IN_TOKEN_LIST";
            case Status.TokenTransferListSizeLimitExceeded: return "TOKEN_TRANSFER_LIST_SIZE_LIMIT_EXCEEDED";
            case Status.EmptyTokenTransferBody: return "EMPTY_TOKEN_TRANSFER_BODY";
            case Status.EmptyTokenTransferAccountAmounts: return "EMPTY_TOKEN_TRANSFER_ACCOUNT_AMOUNTS";
            case Status.InvalidScheduleId: return "INVALID_SCHEDULE_ID";
            case Status.ScheduleIsImmutable: return "SCHEDULE_IS_IMMUTABLE";
            case Status.InvalidSchedulePayerId: return "INVALID_SCHEDULE_PAYER_ID";
            case Status.InvalidScheduleAccountId: return "INVALID_SCHEDULE_ACCOUNT_ID";
            case Status.NoNewValidSignatures: return "NO_NEW_VALID_SIGNATURES";
            case Status.UnresolvableRequiredSigners: return "UNRESOLVABLE_REQUIRED_SIGNERS";
            case Status.ScheduledTransactionNotInWhitelist: return "SCHEDULED_TRANSACTION_NOT_IN_WHITELIST";
            case Status.SomeSignaturesWereInvalid: return "SOME_SIGNATURES_WERE_INVALID";
            case Status.TransactionIdFieldNotAllowed: return "TRANSACTION_ID_FIELD_NOT_ALLOWED";
            case Status.IdenticalScheduleAlreadyCreated: return "IDENTICAL_SCHEDULE_ALREADY_CREATED";
            case Status.InvalidZeroByteInString: return "INVALID_ZERO_BYTE_IN_STRING";
            case Status.ScheduleAlreadyDeleted: return "SCHEDULE_ALREADY_DELETED";
            case Status.ScheduleAlreadyExecuted: return "SCHEDULE_ALREADY_EXECUTED";
            case Status.MessageSizeTooLarge: return "MESSAGE_SIZE_TOO_LARGE";
            case Status.OperationRepeatedInBucketGroups: return "OPERATION_REPEATED_IN_BUCKET_GROUPS";
            case Status.BucketCapacityOverflow: return "BUCKET_CAPACITY_OVERFLOW";
            case Status.NodeCapacityNotSufficientForOperation: return "NODE_CAPACITY_NOT_SUFFICIENT_FOR_OPERATION";
            case Status.BucketHasNoThrottleGroups: return "BUCKET_HAS_NO_THROTTLE_GROUPS";
            case Status.ThrottleGroupHasZeroOpsPerSec: return "THROTTLE_GROUP_HAS_ZERO_OPS_PER_SEC";
            case Status.SuccessButMissingExpectedOperation: return "SUCCESS_BUT_MISSING_EXPECTED_OPERATION";
            case Status.UnparseableThrottleDefinitions: return "UNPARSEABLE_THROTTLE_DEFINITIONS";
            case Status.InvalidThrottleDefinitions: return "INVALID_THROTTLE_DEFINITIONS";
            case Status.AccountExpiredAndPendingRemoval: return "ACCOUNT_EXPIRED_AND_PENDING_REMOVAL";
            case Status.InvalidTokenMaxSupply: return "INVALID_TOKEN_MAX_SUPPLY";
            case Status.InvalidTokenNftSerialNumber: return "INVALID_TOKEN_NFT_SERIAL_NUMBER";
            case Status.InvalidNftId: return "INVALID_NFT_ID";
            case Status.MetadataTooLong: return "METADATA_TOO_LONG";
            case Status.BatchSizeLimitExceeded: return "BATCH_SIZE_LIMIT_EXCEEDED";
            case Status.InvalidQueryRange: return "INVALID_QUERY_RANGE";
            case Status.FractionDividesByZero: return "FRACTION_DIVIDES_BY_ZERO";
            case Status.InsufficientPayerBalanceForCustomFee: return "INSUFFICIENT_PAYER_BALANCE_FOR_CUSTOM_FEE";
            case Status.CustomFeesListTooLong: return "CUSTOM_FEES_LIST_TOO_LONG";
            case Status.InvalidCustomFeeCollector: return "INVALID_CUSTOM_FEE_COLLECTOR";
            case Status.InvalidTokenIdInCustomFees: return "INVALID_TOKEN_ID_IN_CUSTOM_FEES";
            case Status.TokenNotAssociatedToFeeCollector: return "TOKEN_NOT_ASSOCIATED_TO_FEE_COLLECTOR";
            case Status.TokenMaxSupplyReached: return "TOKEN_MAX_SUPPLY_REACHED";
            case Status.SenderDoesNotOwnNftSerialNo: return "SENDER_DOES_NOT_OWN_NFT_SERIAL_NO";
            case Status.CustomFeeNotFullySpecified: return "CUSTOM_FEE_NOT_FULLY_SPECIFIED";
            case Status.CustomFeeMustBePositive: return "CUSTOM_FEE_MUST_BE_POSITIVE";
            case Status.TokenHasNoFeeScheduleKey: return "TOKEN_HAS_NO_FEE_SCHEDULE_KEY";
            case Status.CustomFeeOutsideNumericRange: return "CUSTOM_FEE_OUTSIDE_NUMERIC_RANGE";
            case Status.InvalidCustomFractionalFeesSum: return "INVALID_CUSTOM_FRACTIONAL_FEES_SUM";
            case Status.FractionalFeeMaxAmountLessThanMinAmount: return "FRACTIONAL_FEE_MAX_AMOUNT_LESS_THAN_MIN_AMOUNT";
            case Status.CustomScheduleAlreadyHasNoFees: return "CUSTOM_SCHEDULE_ALREADY_HAS_NO_FEES";
            case Status.CustomFeeDenominationMustBeFungibleCommon: return "CUSTOM_FEE_DENOMINATION_MUST_BE_FUNGIBLE_COMMON";
            case Status.CustomFractionalFeeOnlyAllowedForFungibleCommon: return "CUSTOM_FRACTIONAL_FEE_ONLY_ALLOWED_FOR_FUNGIBLE_COMMON";
            case Status.InvalidCustomFeeScheduleKey: return "INVALID_CUSTOM_FEE_SCHEDULE_KEY";
            case Status.InvalidTokenMintMetadata: return "INVALID_TOKEN_MINT_METADATA";
            case Status.InvalidTokenBurnMetadata: return "INVALID_TOKEN_BURN_METADATA";
            case Status.CurrentTreasuryStillOwnsNfts: return "CURRENT_TREASURY_STILL_OWNS_NFTS";
            default: return `UNKNOWN STATUS CODE (${this.code})`;
        }
    }

    // NOT A STABLE API
    public _isBusy(): boolean {
        return Status.Busy === this;
    }

    public static _fromCode(code: number): Status {
        return (Status as unknown as Indexed)[ code ] ?? new Status(code);
    }

    // NOT A STABLE API
    public _isError(): boolean {
        switch (this) {
            case Status.Success:
            case Status.Ok:
                return false;

            case Status.Unknown:
            case Status.ReceiptNotFound:
            case Status.RecordNotFound:
                return true;

            default:
                return true;
        }
    }

    // NOT A STABLE API
    public _throwIfError(): void {
        if (this._isError()) {
            throw new HederaStatusError(this);
        }
    }
}
