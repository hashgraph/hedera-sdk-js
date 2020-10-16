/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 */

export default class Status {
    /**
     * @hideconstructor
     * @internal
     * @param {number} code
     */
    constructor(code) {
        /** @readonly */
        this._code = code;

        Object.freeze(this);
    }

    /**
     * @returns {string}
     */
    toString() {
        switch (this) {
            case Status.Ok:
                return "OK";
            case Status.InvalidTransaction:
                return "INVALID_TRANSACTION";
            case Status.PayerAccountNotFound:
                return "PAYER_ACCOUNT_NOT_FOUND";
            case Status.InvalidNodeAccount:
                return "INVALID_NODE_ACCOUNT";
            case Status.TransactionExpired:
                return "TRANSACTION_EXPIRED";
            case Status.InvalidTransactionStart:
                return "INVALID_TRANSACTION_START";
            case Status.InvalidTransactionDuration:
                return "INVALID_TRANSACTION_DURATION";
            case Status.InvalidSignature:
                return "INVALID_SIGNATURE";
            case Status.MemoTooLong:
                return "MEMO_TOO_LONG";
            case Status.InsufficientTxFee:
                return "INSUFFICIENT_TX_FEE";
            case Status.InsufficientPayerBalance:
                return "INSUFFICIENT_PAYER_BALANCE";
            case Status.DuplicateTransaction:
                return "DUPLICATE_TRANSACTION";
            case Status.Busy:
                return "BUSY";
            case Status.NotSupported:
                return "NOT_SUPPORTED";
            case Status.InvalidFileId:
                return "INVALID_FILE_ID";
            case Status.InvalidAccountId:
                return "INVALID_ACCOUNT_ID";
            case Status.InvalidContractId:
                return "INVALID_CONTRACT_ID";
            case Status.InvalidTransactionId:
                return "INVALID_TRANSACTION_ID";
            case Status.ReceiptNotFound:
                return "RECEIPT_NOT_FOUND";
            case Status.RecordNotFound:
                return "RECORD_NOT_FOUND";
            case Status.InvalidSolidityId:
                return "INVALID_SOLIDITY_ID";
            case Status.Unknown:
                return "UNKNOWN";
            case Status.Success:
                return "SUCCESS";
            case Status.FailInvalid:
                return "FAIL_INVALID";
            case Status.FailFee:
                return "FAIL_FEE";
            case Status.FailBalance:
                return "FAIL_BALANCE";
            case Status.KeyRequired:
                return "KEY_REQUIRED";
            case Status.BadEncoding:
                return "BAD_ENCODING";
            case Status.InsufficientAccountBalance:
                return "INSUFFICIENT_ACCOUNT_BALANCE";
            case Status.InvalidSolidityAddress:
                return "INVALID_SOLIDITY_ADDRESS";
            case Status.InsufficientGas:
                return "INSUFFICIENT_GAS";
            case Status.ContractSizeLimitExceeded:
                return "CONTRACT_SIZE_LIMIT_EXCEEDED";
            case Status.LocalCallModificationException:
                return "LOCAL_CALL_MODIFICATION_EXCEPTION";
            case Status.ContractRevertExecuted:
                return "CONTRACT_REVERT_EXECUTED";
            case Status.ContractExecutionException:
                return "CONTRACT_EXECUTION_EXCEPTION";
            case Status.InvalidReceivingNodeAccount:
                return "INVALID_RECEIVING_NODE_ACCOUNT";
            case Status.MissingQueryHeader:
                return "MISSING_QUERY_HEADER";
            case Status.AccountUpdateFailed:
                return "ACCOUNT_UPDATE_FAILED";
            case Status.InvalidKeyEncoding:
                return "INVALID_KEY_ENCODING";
            case Status.NullSolidityAddress:
                return "NULL_SOLIDITY_ADDRESS";
            case Status.ContractUpdateFailed:
                return "CONTRACT_UPDATE_FAILED";
            case Status.InvalidQueryHeader:
                return "INVALID_QUERY_HEADER";
            case Status.InvalidFeeSubmitted:
                return "INVALID_FEE_SUBMITTED";
            case Status.InvalidPayerSignature:
                return "INVALID_PAYER_SIGNATURE";
            case Status.KeyNotProvided:
                return "KEY_NOT_PROVIDED";
            case Status.InvalidExpirationTime:
                return "INVALID_EXPIRATION_TIME";
            case Status.NoWaclKey:
                return "NO_WACL_KEY";
            case Status.FileContentEmpty:
                return "FILE_CONTENT_EMPTY";
            case Status.InvalidAccountAmounts:
                return "INVALID_ACCOUNT_AMOUNTS";
            case Status.EmptyTransactionBody:
                return "EMPTY_TRANSACTION_BODY";
            case Status.InvalidTransactionBody:
                return "INVALID_TRANSACTION_BODY";
            case Status.InvalidSignatureTypeMismatchingKey:
                return "INVALID_SIGNATURE_TYPE_MISMATCHING_KEY";
            case Status.InvalidSignatureCountMismatchingKey:
                return "INVALID_SIGNATURE_COUNT_MISMATCHING_KEY";
            case Status.EmptyClaimBody:
                return "EMPTY_CLAIM_BODY";
            case Status.EmptyClaimHash:
                return "EMPTY_CLAIM_HASH";
            case Status.EmptyClaimKeys:
                return "EMPTY_CLAIM_KEYS";
            case Status.InvalidClaimHashSize:
                return "INVALID_CLAIM_HASH_SIZE";
            case Status.EmptyQueryBody:
                return "EMPTY_QUERY_BODY";
            case Status.EmptyClaimQuery:
                return "EMPTY_CLAIM_QUERY";
            case Status.ClaimNotFound:
                return "CLAIM_NOT_FOUND";
            case Status.AccountIdDoesNotExist:
                return "ACCOUNT_ID_DOES_NOT_EXIST";
            case Status.ClaimAlreadyExists:
                return "CLAIM_ALREADY_EXISTS";
            case Status.InvalidFileWacl:
                return "INVALID_FILE_WACL";
            case Status.SerializationFailed:
                return "SERIALIZATION_FAILED";
            case Status.TransactionOversize:
                return "TRANSACTION_OVERSIZE";
            case Status.TransactionTooManyLayers:
                return "TRANSACTION_TOO_MANY_LAYERS";
            case Status.ContractDeleted:
                return "CONTRACT_DELETED";
            case Status.PlatformNotActive:
                return "PLATFORM_NOT_ACTIVE";
            case Status.KeyPrefixMismatch:
                return "KEY_PREFIX_MISMATCH";
            case Status.PlatformTransactionNotCreated:
                return "PLATFORM_TRANSACTION_NOT_CREATED";
            case Status.InvalidRenewalPeriod:
                return "INVALID_RENEWAL_PERIOD";
            case Status.InvalidPayerAccountId:
                return "INVALID_PAYER_ACCOUNT_ID";
            case Status.AccountDeleted:
                return "ACCOUNT_DELETED";
            case Status.FileDeleted:
                return "FILE_DELETED";
            case Status.AccountRepeatedInAccountAmounts:
                return "ACCOUNT_REPEATED_IN_ACCOUNT_AMOUNTS";
            case Status.SettingNegativeAccountBalance:
                return "SETTING_NEGATIVE_ACCOUNT_BALANCE";
            case Status.ObtainerRequired:
                return "OBTAINER_REQUIRED";
            case Status.ObtainerSameContractId:
                return "OBTAINER_SAME_CONTRACT_ID";
            case Status.ObtainerDoesNotExist:
                return "OBTAINER_DOES_NOT_EXIST";
            case Status.ModifyingImmutableContract:
                return "MODIFYING_IMMUTABLE_CONTRACT";
            case Status.FileSystemException:
                return "FILE_SYSTEM_EXCEPTION";
            case Status.AutorenewDurationNotInRange:
                return "AUTORENEW_DURATION_NOT_IN_RANGE";
            case Status.ErrorDecodingBytestring:
                return "ERROR_DECODING_BYTESTRING";
            case Status.ContractFileEmpty:
                return "CONTRACT_FILE_EMPTY";
            case Status.ContractBytecodeEmpty:
                return "CONTRACT_BYTECODE_EMPTY";
            case Status.InvalidInitialBalance:
                return "INVALID_INITIAL_BALANCE";
            case Status.InvalidReceiveRecordThreshold:
                return "INVALID_RECEIVE_RECORD_THRESHOLD";
            case Status.InvalidSendRecordThreshold:
                return "INVALID_SEND_RECORD_THRESHOLD";
            case Status.AccountIsNotGenesisAccount:
                return "ACCOUNT_IS_NOT_GENESIS_ACCOUNT";
            case Status.PayerAccountUnauthorized:
                return "PAYER_ACCOUNT_UNAUTHORIZED";
            case Status.InvalidFreezeTransactionBody:
                return "INVALID_FREEZE_TRANSACTION_BODY";
            case Status.FreezeTransactionBodyNotFound:
                return "FREEZE_TRANSACTION_BODY_NOT_FOUND";
            case Status.TransferListSizeLimitExceeded:
                return "TRANSFER_LIST_SIZE_LIMIT_EXCEEDED";
            case Status.ResultSizeLimitExceeded:
                return "RESULT_SIZE_LIMIT_EXCEEDED";
            case Status.NotSpecialAccount:
                return "NOT_SPECIAL_ACCOUNT";
            case Status.ContractNegativeGas:
                return "CONTRACT_NEGATIVE_GAS";
            case Status.ContractNegativeValue:
                return "CONTRACT_NEGATIVE_VALUE";
            case Status.InvalidFeeFile:
                return "INVALID_FEE_FILE";
            case Status.InvalidExchangeRateFile:
                return "INVALID_EXCHANGE_RATE_FILE";
            case Status.InsufficientLocalCallGas:
                return "INSUFFICIENT_LOCAL_CALL_GAS";
            case Status.EntityNotAllowedToDelete:
                return "ENTITY_NOT_ALLOWED_TO_DELETE";
            case Status.AuthorizationFailed:
                return "AUTHORIZATION_FAILED";
            case Status.FileUploadedProtoInvalid:
                return "FILE_UPLOADED_PROTO_INVALID";
            case Status.FileUploadedProtoNotSavedToDisk:
                return "FILE_UPLOADED_PROTO_NOT_SAVED_TO_DISK";
            case Status.FeeScheduleFilePartUploaded:
                return "FEE_SCHEDULE_FILE_PART_UPLOADED";
            case Status.ExchangeRateChangeLimitExceeded:
                return "EXCHANGE_RATE_CHANGE_LIMIT_EXCEEDED";
            case Status.MaxContractStorageExceeded:
                return "MAX_CONTRACT_STORAGE_EXCEEDED";
            case Status.TransferAccountSameAsDeleteAccount:
                return "TRANSAFER_ACCOUNT_SAME_AS_DELETE_ACCOUNT";
            case Status.TotalLedgerBalanceInvalid:
                return "TOTAL_LEDGER_BALANCE_INVALID";
            case Status.ExpirationReductionNotAllowed:
                return "EXPIRATION_REDUCTION_NOT_ALLOWED";
            case Status.MaxGasLimitExceeded:
                return "MAX_GAS_LIMIT_EXCEEDED";
            case Status.InvalidTopicId:
                return "INVALID_TOPIC_ID";
            case Status.InvalidTopicExpirationTime:
                return "INVALID_TOPIC_EXPIRATION_TIME";
            case Status.InvalidAdminKey:
                return "INVALID_ADMIN_KEY";
            case Status.InvalidSubmitKey:
                return "INVALID_SUBMIT_KEY";
            case Status.Unauthorized:
                return "UNAUTHORIZED";
            case Status.InvalidTopicMessage:
                return "INVALID_TOPIC_MESSAGE";
            case Status.InvalidAutorenewAccount:
                return "INVALID_AUTORENEW_ACCOUNT";
            case Status.AutoRenewAccountNotAllowed:
                return "AUTORENEW_ACCOUNT_NOT_ALLOWED";
            case Status.AutoRenewAccountSignatureMissing:
                return "AUTORENEW_ACCOUNT_SIGNATURE_MISSING";
            case Status.TopicExpired:
                return "TOPIC_EXPIRED";
            default:
                return `UNKNOWN (${this._code})`;
        }
    }

    /**
     * @internal
     * @param {number} code
     * @returns {Status}
     */
    static _fromCode(code) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Status[code] != null ? Status[code] : new Status(code);
    }

    /**
     * @returns {proto.ResponseCodeEnum}
     */
    valueOf() {
        return this._code;
    }
}

/**
 * The transaction passed the precheck validations.
 */
Status.Ok = new Status(0);

/**
 * For any error not handled by specific error codes listed below.
 */
Status.InvalidTransaction = new Status(1);

/**
 * Payer account does not exist.
 */
Status.PayerAccountNotFound = new Status(2);

/**
 * Node Account provided does not match the node account of the node the transaction was submitted to.
 */
Status.InvalidNodeAccount = new Status(3);

/**
 * Pre-Check error when TransactionValidStart + transactionValidDuration is less than current consensus time.
 */
Status.TransactionExpired = new Status(4);

/**
 * Transaction start time is greater than current consensus time
 */
Status.InvalidTransactionStart = new Status(5);

/**
 * Valid transaction duration is a positive non zero number that does not exceed 120 seconds
 */
Status.InvalidTransactionDuration = new Status(6);

/**
 * The transaction signature is not valid
 */
Status.InvalidSignature = new Status(7);

/**
 * Transaction memo size exceeded 100 bytes
 */
Status.MemoTooLong = new Status(8);

/**
 * The fee provided in the transaction is insufficient for this type of transaction
 */
Status.InsufficientTxFee = new Status(9);

/**
 * The payer account has insufficient cryptocurrency to pay the transaction fee
 */
Status.InsufficientPayerBalance = new Status(10);

/**
 * This transaction ID is a duplicate of one that was submitted to this node or reached consensus in the last 180 seconds (receipt period)
 */
Status.DuplicateTransaction = new Status(11);

/**
 * If API is throttled out
 */
Status.Busy = new Status(12);

/**
 * The API is not currently supported
 */
Status.NotSupported = new Status(13);

/**
 * The file id is invalid or does not exist
 */
Status.InvalidFileId = new Status(14);

/**
 * The account id is invalid or does not exist
 */
Status.InvalidAccountId = new Status(15);

/**
 * The contract id is invalid or does not exist
 */
Status.InvalidContractId = new Status(16);

/**
 * Transaction id is not valid
 */
Status.InvalidTransactionId = new Status(17);

/**
 * Receipt for given transaction id does not exist
 */
Status.ReceiptNotFound = new Status(18);

/**
 * Record for given transaction id does not exist
 */
Status.RecordNotFound = new Status(19);

/**
 * The solidity id is invalid or entity with this solidity id does not exist
 */
Status.InvalidSolidityId = new Status(20);

/**
 * Transaction hasn't yet reached consensus, or has already expired
 */
Status.Unknown = new Status(21);

/**
 * The transaction succeeded
 */
Status.Success = new Status(22);

/**
 * There was a system error and the transaction failed because of invalid request parameters.
 */
Status.FailInvalid = new Status(23);

/**
 * There was a system error while performing fee calculation, reserved for future.
 */
Status.FailFee = new Status(24);

/**
 * There was a system error while performing balance checks, reserved for future.
 */
Status.FailBalance = new Status(25);

/**
 * Key not provided in the transaction body
 */
Status.KeyRequired = new Status(26);

/**
 * Unsupported algorithm/encoding used for keys in the transaction
 */
Status.BadEncoding = new Status(27);

/**
 * When the account balance is not sufficient for the transfer
 */
Status.InsufficientAccountBalance = new Status(28);

/**
 * During an update transaction when the system is not able to find the Users Solidity address
 */
Status.InvalidSolidityAddress = new Status(29);

/**
 * Not enough gas was supplied to execute transaction
 */
Status.InsufficientGas = new Status(30);

/**
 * Contract byte code size is over the limit
 */
Status.ContractSizeLimitExceeded = new Status(31);

/**
 * local execution (query) is requested for a function which changes state
 */
Status.LocalCallModificationException = new Status(32);

/**
 * Contract REVERT OPCODE executed
 */
Status.ContractRevertExecuted = new Status(33);

/**
 * For any contract execution related error not handled by specific error codes listed above.
 */
Status.ContractExecutionException = new Status(34);

/**
 * In Query validation, account with +ve(amount) value should be Receiving node account,
 * the receiver account should be only one account in the list
 */
Status.InvalidReceivingNodeAccount = new Status(35);

/**
 * Header is missing in Query request
 */
Status.MissingQueryHeader = new Status(36);

/**
 * The update of the account failed
 */
Status.AccountUpdateFailed = new Status(37);

/**
 * Provided key encoding was not supported by the system
 */
Status.InvalidKeyEncoding = new Status(38);

/**
 * Null solidity address
 */
Status.NullSolidityAddress = new Status(39);

/**
 * Update of the contract failed
 */
Status.ContractUpdateFailed = new Status(40);

/**
 * The query header is invalid
 */
Status.InvalidQueryHeader = new Status(41);

/**
 * Invalid fee submitted
 */
Status.InvalidFeeSubmitted = new Status(42);

/**
 * Payer signature is invalid
 */
Status.InvalidPayerSignature = new Status(43);

/**
 * The keys were not provided in the request.
 */
Status.KeyNotProvided = new Status(44);

/**
 * Expiration time provided in the transaction was invalid.
 */
Status.InvalidExpirationTime = new Status(45);

/**
 * WriteAccess Control Keys are not provided for the file
 */
Status.NoWaclKey = new Status(46);

/**
 * The contents of file are provided as empty.
 */
Status.FileContentEmpty = new Status(47);

/**
 * The crypto transfer credit and debit do not sum equal to 0
 */
Status.InvalidAccountAmounts = new Status(48);

/**
 * Transaction body provided is empty
 */
Status.EmptyTransactionBody = new Status(49);

/**
 * Invalid transaction body provided
 */
Status.InvalidTransactionBody = new Status(50);

/**
 * The type of key (base ed25519 key, KeyList, or ThresholdKey) does not match the type of
 * signature (base ed25519 signature, SignatureList, or ThresholdKeySignature).
 */
Status.InvalidSignatureTypeMismatchingKey = new Status(51);

/**
 * The number of key (KeyList, or ThresholdKey) does not match that of signature
 * (SignatureList, or ThresholdKeySignature). e.g. if a keyList has 3 base keys,
 * then the corresponding signatureList should also have 3 base signatures.
 */
Status.InvalidSignatureCountMismatchingKey = new Status(52);

/**
 * The claim body is empty.
 */
Status.EmptyClaimBody = new Status(53);

/**
 * The hash for the claim is empty
 */
Status.EmptyClaimHash = new Status(54);

/**
 * The key list is empty
 */
Status.EmptyClaimKeys = new Status(55);

/**
 * The size of the claim hash is not 48 bytes
 */
Status.InvalidClaimHashSize = new Status(56);

/**
 * The query body is empty
 */
Status.EmptyQueryBody = new Status(57);

/**
 * The crypto claim query is empty
 */
Status.EmptyClaimQuery = new Status(58);

/**
 * The crypto claim doesn't exists in the file system. It expired or was never persisted.
 */
Status.ClaimNotFound = new Status(59);

/**
 * The account id passed has not yet been created.
 */
Status.AccountIdDoesNotExist = new Status(60);

/**
 * The claim hash already exists
 */
Status.ClaimAlreadyExists = new Status(61);

/**
 * File WACL keys are invalid
 */
Status.InvalidFileWacl = new Status(62);

/**
 * Serialization failure
 */
Status.SerializationFailed = new Status(63);

/**
 * The size of the Transaction is greater than transactionMaxBytes
 */
Status.TransactionOversize = new Status(64);

/**
 * The Transaction has more than 50 levels
 */
Status.TransactionTooManyLayers = new Status(65);

/**
 * Contract is marked as deleted
 */
Status.ContractDeleted = new Status(66);

/**
 * The platform node is either disconnected or lagging behind.
 */
Status.PlatformNotActive = new Status(67);

/**
 * One key matches more than one prefixes on the signature map.
 */
Status.KeyPrefixMismatch = new Status(68);

/**
 * Transaction not created by platform due to either large backlog or
 * message size exceeded transactionMaxBytes.
 */
Status.PlatformTransactionNotCreated = new Status(69);

/**
 * Auto renewal period is not a positive number of seconds.
 */
Status.InvalidRenewalPeriod = new Status(70);

/**
 * The response code when a smart contract id is passed for a crypto API request.
 */
Status.InvalidPayerAccountId = new Status(71);

/**
 * The account has been marked as deleted.
 */
Status.AccountDeleted = new Status(72);

/**
 * The file has been marked as deleted.
 */
Status.FileDeleted = new Status(73);

/**
 * Same accounts repeated in the transfer account list.
 */
Status.AccountRepeatedInAccountAmounts = new Status(74);

/**
 * Attempting to set negative balance value for crypto account.
 */
Status.SettingNegativeAccountBalance = new Status(75);

/**
 * When deleting smart contract that has crypto balance either transfer account or transfer.
 * smart contract is required.
 */
Status.ObtainerRequired = new Status(76);

/**
 * When deleting smart contract that has crypto balance you can not use the same contract id
 * as transferContractId as the one being deleted.
 */
Status.ObtainerSameContractId = new Status(77);

/**
 * TransferAccountId or transferContractId specified for contract delete does not exist.
 */
Status.ObtainerDoesNotExist = new Status(78);

/**
 * Attempting to modify (update or delete a immutable smart contract,
 * i.e. one created without a admin key).
 */
Status.ModifyingImmutableContract = new Status(79);

/**
 * Unexpected exception thrown by file system functions.
 */
Status.FileSystemException = new Status(80);

/**
 * The duration is not a subset of [MINIMUM_AUTORENEW_DURATION,MAXIMUM_AUTORENEW_DURATION].
 */
Status.AutorenewDurationNotInRange = new Status(81);

/**
 * Decoding the smart contract binary to a byte array failed.
 * Check that the input is a valid hex string.
 */
Status.ErrorDecodingBytestring = new Status(82);

/**
 * File to create a smart contract was of length zero.
 */
Status.ContractFileEmpty = new Status(83);

/**
 * Bytecode for smart contract is of length zero.
 */
Status.ContractBytecodeEmpty = new Status(84);

/**
 * Attempt to set negative initial balance.
 */
Status.InvalidInitialBalance = new Status(85);

/**
 * Attempt to set negative receive record threshold.
 */
Status.InvalidReceiveRecordThreshold = new Status(86);

/**
 * Attempt to set negative send record threshold.
 */
Status.InvalidSendRecordThreshold = new Status(87);

/**
 * Special Account Operations should be performed by only Genesis account, return this code if it is not Genesis Account
 */
Status.AccountIsNotGenesisAccount = new Status(88);

/**
 * The fee payer account doesn't have permission to submit such Transaction
 */
Status.PayerAccountUnauthorized = new Status(89);

/**
 * FreezeTransactionBody is invalid
 */
Status.InvalidFreezeTransactionBody = new Status(90);

/**
 * FreezeTransactionBody does not exist
 */
Status.FreezeTransactionBodyNotFound = new Status(91);

/**
 * Exceeded the number of accounts (both from and to) allowed for crypto transfer list.
 */
Status.TransferListSizeLimitExceeded = new Status(92);

/**
 * Smart contract result size greater than specified maxResultSize.
 */
Status.ResultSizeLimitExceeded = new Status(93);

/**
 * The payer account is not a special account(account 0.0.55).
 */
Status.NotSpecialAccount = new Status(94);

/**
 * Negative gas was offered in smart contract call.
 */
Status.ContractNegativeGas = new Status(95);

/**
 * Negative value / initial balance was specified in a smart contract call / create.
 */
Status.ContractNegativeValue = new Status(96);

/**
 * Failed to update fee file.
 */
Status.InvalidFeeFile = new Status(97);

/**
 * Failed to update exchange rate file.
 */
Status.InvalidExchangeRateFile = new Status(98);

/**
 * Payment tendered for contract local call cannot cover both the fee and the gas.
 */
Status.InsufficientLocalCallGas = new Status(99);

/**
 * Entities with Entity ID below 1000 are not allowed to be deleted.
 */
Status.EntityNotAllowedToDelete = new Status(100);

/**
 * Violating one of these rules: 1) treasury account can update all entities below 0.0.1000, 2)
 * account 0.0.50 can update all entities from 0.0.51 - 0.0.80, 3) Network Function Master
 * Account A/c 0.0.50 - Update all Network Function accounts & perform all the Network Functions
 * listed below, 4) Network Function Accounts: i) A/c 0.0.55 - Update Address Book files
 * (0.0.101/102), ii) A/c 0.0.56 - Update Fee schedule (0.0.111), iii) A/c 0.0.57 -
 * Update Exchange Rate (0.0.112).
 */
Status.AuthorizationFailed = new Status(101);

/**
 * Fee Schedule Proto uploaded but not valid (append or update is required).
 */
Status.FileUploadedProtoInvalid = new Status(102);

/**
 * Fee Schedule Proto uploaded but not valid (append or update is required).
 */
Status.FileUploadedProtoNotSavedToDisk = new Status(103);

/**
 * Fee Schedule Proto File Part uploaded.
 */
Status.FeeScheduleFilePartUploaded = new Status(104);

/**
 * The change on Exchange Rate exceeds Exchange_Rate_Allowed_Percentage.
 */
Status.ExchangeRateChangeLimitExceeded = new Status(105);

/**
 * Contract permanent storage exceeded the currently allowable limit
 */
Status.MaxContractStorageExceeded = new Status(106);

/**
 * Transfer Account should not be same as Account to be deleted
 */
Status.TransferAccountSameAsDeleteAccount = new Status(107);

Status.TotalLedgerBalanceInvalid = new Status(108);

/**
 * The expiration date/time on a smart contract may not be reduced.
 */
Status.ExpirationReductionNotAllowed = new Status(110);

/**
 * Gas exceeded currently allowable gas limit per transaction
 */
Status.MaxGasLimitExceeded = new Status(111);

/**
 * The Topic ID specified is not in the system.
 */
Status.InvalidTopicId = new Status(150);

Status.InvalidTopicExpirationTime = new Status(154);
Status.InvalidAdminKey = new Status(155);
Status.InvalidSubmitKey = new Status(156);

/**
 * An attempted operation was not authorized (ie - a deleteTopic for a topic with no adminKey).
 */
Status.Unauthorized = new Status(157);

/**
 * A ConsensusService message is empty.
 */
Status.InvalidTopicMessage = new Status(158);

/**
 * The autoRenewAccount specified is not a valid, active account.
 */
Status.InvalidAutorenewAccount = new Status(159);

/**
 * An admin key was not specified on the topic, so there must not be an autorenew account.
 */
Status.AutoRenewAccountNotAllowed = new Status(160);

/**
 * The autoRenewAccount didn't sign the transaction.
 */
Status.AutoRenewAccountSignatureMissing = new Status(161);

/**
 * The topic has expired, was not automatically renewed, and is in a 7 day grace period before
 * the topic will be deleted unrecoverably. This error response code will not be returned
 * until autoRenew functionality is supported by HAPI.
 */
Status.TopicExpired = new Status(162);
