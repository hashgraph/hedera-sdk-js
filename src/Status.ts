import { HederaStatusError } from "./errors/HederaStatusError";

interface Indexed {
    [code: number]: Status;
}

export class Status implements Indexed {
    // Index signatures
    [code: number]: Status;

    public static readonly Ok = new Status(0);
    public static readonly InvalidTransaction = new Status(1);
    public static readonly PayerAccountNotFound = new Status(2);
    public static readonly InvalidNodeAccount = new Status(3);
    public static readonly TransactionExpired = new Status(4);
    public static readonly InvalidTransactionStart = new Status(5);
    public static readonly InvalidTransactionDuration = new Status(6);
    public static readonly InvalidSignature = new Status(7);
    public static readonly MemoTooLong = new Status(8);
    public static readonly InsufficientTxFee = new Status(9);
    public static readonly InsufficientPayerBalance = new Status(10);
    public static readonly DuplicateTransaction = new Status(11);
    public static readonly Busy = new Status(12);
    public static readonly NotSupported = new Status(13);
    public static readonly InvalidFileId = new Status(14);
    public static readonly InvalidAccountId = new Status(15);
    public static readonly InvalidContractId = new Status(16);
    public static readonly InvalidTransactionId = new Status(17);
    public static readonly ReceiptNotFound = new Status(18);
    public static readonly RecordNotFound = new Status(19);
    public static readonly InvalidSolidityId = new Status(20);
    public static readonly Unknown = new Status(21);
    public static readonly Success = new Status(22);
    public static readonly FailInvalid = new Status(23);
    public static readonly FailFee = new Status(24);
    public static readonly FailBalance = new Status(25);
    public static readonly KeyRequired = new Status(26);
    public static readonly BadEncoding = new Status(27);
    public static readonly InsufficientAccountBalance = new Status(28);
    public static readonly InvalidSolidityAddress = new Status(29);
    public static readonly InsufficientGas = new Status(30);
    public static readonly ContractSizeLimitExceeded = new Status(31);
    public static readonly LocalCallModificationException = new Status(32);
    public static readonly ContractRevertExecuted = new Status(33);
    public static readonly ContractExecutionException = new Status(34);
    public static readonly InvalidReceivingNodeAccount = new Status(35);
    public static readonly MissingQueryHeader = new Status(36);
    public static readonly AccountUpdateFailed = new Status(37);
    public static readonly InvalidKeyEncoding = new Status(38);
    public static readonly NullSolidityAddress = new Status(39);
    public static readonly ContractUpdateFailed = new Status(40);
    public static readonly InvalidQueryHeader = new Status(41);
    public static readonly InvalidFeeSubmitted = new Status(42);
    public static readonly InvalidPayerSignature = new Status(43);
    public static readonly KeyNotProvided = new Status(44);
    public static readonly InvalidExpirationTime = new Status(45);
    public static readonly NoWaclKey = new Status(46);
    public static readonly FileContentEmpty = new Status(47);
    public static readonly InvalidAccountAmounts = new Status(48);
    public static readonly EmptyTransactionBody = new Status(49);
    public static readonly InvalidTransactionBody = new Status(50);
    public static readonly InvalidSignatureTypeMismatchingKey = new Status(51);
    public static readonly InvalidSignatureCountMismatchingKey = new Status(52);
    public static readonly EmptyClaimBody = new Status(53);
    public static readonly EmptyClaimHash = new Status(54);
    public static readonly EmptyClaimKeys = new Status(55);
    public static readonly InvalidClaimHashSize = new Status(56);
    public static readonly EmptyQueryBody = new Status(57);
    public static readonly EmptyClaimQuery = new Status(58);
    public static readonly ClaimNotFound = new Status(59);
    public static readonly AccountIdDoesNotExist = new Status(60);
    public static readonly ClaimAlreadyExists = new Status(61);
    public static readonly InvalidFileWacl = new Status(62);
    public static readonly SerializationFailed = new Status(63);
    public static readonly TransactionOversize = new Status(64);
    public static readonly TransactionTooManyLayers = new Status(65);
    public static readonly ContractDeleted = new Status(66);
    public static readonly PlatformNotActive = new Status(67);
    public static readonly KeyPrefixMismatch = new Status(68);
    public static readonly PlatformTransactionNotCreated = new Status(69);
    public static readonly InvalidRenewalPeriod = new Status(70);
    public static readonly InvalidPayerAccountId = new Status(71);
    public static readonly AccountDeleted = new Status(72);
    public static readonly FileDeleted = new Status(73);
    public static readonly AccountRepeatedInAccountAmounts = new Status(74);
    public static readonly SettingNegativeAccountBalance = new Status(75);
    public static readonly ObtainerRequired = new Status(76);
    public static readonly ObtainerSameContractId = new Status(77);
    public static readonly ObtainerDoesNotExist = new Status(78);
    public static readonly ModifyingImmutableContract = new Status(79);
    public static readonly FileSystemException = new Status(80);
    public static readonly AutorenewDurationNotInRange = new Status(81);
    public static readonly ErrorDecodingBytestring = new Status(82);
    public static readonly ContractFileEmpty = new Status(83);
    public static readonly ContractBytecodeEmpty = new Status(84);
    public static readonly InvalidInitialBalance = new Status(85);
    public static readonly InvalidReceiveRecordThreshold = new Status(86);
    public static readonly InvalidSendRecordThreshold = new Status(87);
    public static readonly AccountIsNotGenesisAccount = new Status(88);
    public static readonly PayerAccountUnauthorized = new Status(89);
    public static readonly InvalidFreezeTransactionBody = new Status(90);
    public static readonly FreezeTransactionBodyNotFound = new Status(91);
    public static readonly TransferListSizeLimitExceeded = new Status(92);
    public static readonly ResultSizeLimitExceeded = new Status(93);
    public static readonly NotSpecialAccount = new Status(94);
    public static readonly ContractNegativeGas = new Status(95);
    public static readonly ContractNegativeValue = new Status(96);
    public static readonly InvalidFeeFile = new Status(97);
    public static readonly InvalidExchangeRateFile = new Status(98);
    public static readonly InsufficientLocalCallGas = new Status(99);
    public static readonly EntityNotAllowedToDelete = new Status(100);
    public static readonly AuthorizationFailed = new Status(101);
    public static readonly FileUploadedProtoInvalid = new Status(102);
    public static readonly FileUploadedProtoNotSavedToDisk = new Status(103);
    public static readonly FeeScheduleFilePartUploaded = new Status(104);
    public static readonly ExchangeRateChangeLimitExceeded = new Status(105);

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
    private static [ 53 ] = Status.EmptyClaimBody;
    private static [ 54 ] = Status.EmptyClaimHash;
    private static [ 55 ] = Status.EmptyClaimKeys;
    private static [ 56 ] = Status.InvalidClaimHashSize;
    private static [ 57 ] = Status.EmptyQueryBody;
    private static [ 58 ] = Status.EmptyClaimQuery;
    private static [ 59 ] = Status.ClaimNotFound;
    private static [ 60 ] = Status.AccountIdDoesNotExist;
    private static [ 61 ] = Status.ClaimAlreadyExists;
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
            case Status.EmptyClaimBody: return "EMPTY_CLAIM_BODY";
            case Status.EmptyClaimHash: return "EMPTY_CLAIM_HASH";
            case Status.EmptyClaimKeys: return "EMPTY_CLAIM_KEYS";
            case Status.InvalidClaimHashSize: return "INVALID_CLAIM_HASH_SIZE";
            case Status.EmptyQueryBody: return "EMPTY_QUERY_BODY";
            case Status.EmptyClaimQuery: return "EMPTY_CLAIM_QUERY";
            case Status.ClaimNotFound: return "CLAIM_NOT_FOUND";
            case Status.AccountIdDoesNotExist: return "ACCOUNT_ID_DOES_NOT_EXIST";
            case Status.ClaimAlreadyExists: return "CLAIM_ALREADY_EXISTS";
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
