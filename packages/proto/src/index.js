import * as $protobuf from "protobufjs/minimal.js";
import { proto } from "./proto.js";

// ============================================================================
// Utility
// ============================================================================

// re-export protobuf reader for usage by @hashgraph/sdk
export const Reader = $protobuf.Reader;
export const Writer = $protobuf.Writer;

// ============================================================================
// Services
// ============================================================================

export const ConsensusService = proto.ConsensusService;
export const CryptoService = proto.CryptoService;
export const FileService = proto.FileService;
export const FreezeService = proto.FreezeService;
export const MirrorConsensusService = proto.MirrorConsensusService;
export const NetworkService = proto.NetworkService;
export const ScheduleService = proto.ScheduleService;
export const SmartContractService = proto.SmartContractService;
export const TokenService = proto.TokenService;

// ============================================================================
// Types
// ============================================================================

export const AccountID = proto.AccountID;
export const ConsensusTopicInfo = proto.ConsensusTopicInfo;
export const ConsensusTopicQuery = proto.ConsensusTopicQuery;
export const ConsensusTopicResponse = proto.ConsensusTopicResponse;
export const ContractGetInfoResponse = proto.ContractGetInfoResponse;
export const ContractID = proto.ContractID;
export const CryptoGetInfoResponse = proto.CryptoGetInfoResponse;
export const FileGetInfoResponse = proto.FileGetInfoResponse;
export const FileID = proto.FileID;
export const Key = proto.Key;
export const KeyList = proto.KeyList;
export const NetworkGetVersionInfoResponse = proto.NetworkGetVersionInfoResponse;
export const Query = proto.Query;
export const ResponseCodeEnum = proto.ResponseCodeEnum;
export const ResponseType = proto.ResponseType;
export const SchedulableTransactionBody = proto.SchedulableTransactionBody;
export const ScheduleGetInfoResponse = proto.ScheduleGetInfoResponse;
export const ScheduleID = proto.ScheduleID;
export const SemanticVersion = proto.SemanticVersion;
export const SignedTransaction = proto.SignedTransaction;
export const ThresholdKey = proto.ThresholdKey;
export const TokenFreezeStatus = proto.TokenFreezeStatus;
export const TokenID = proto.TokenID;
export const TokenInfo = proto.TokenInfo;
export const TokenKycStatus = proto.TokenKycStatus;
export const TopicID = proto.TopicID;
export const Transaction = proto.Transaction;
export const TransactionBody = proto.TransactionBody;
export const TransactionID = proto.TransactionID;
export const TransactionList = proto.TransactionList;
export const TransactionReceipt = proto.TransactionReceipt;
export const TransactionRecord = proto.TransactionRecord;
export const CurrentAndNextFeeSchedule = proto.CurrentAndNextFeeSchedule;
export const FeeSchedules = proto.FeeSchedule;
export const FeeComponents = proto.FeeComponents;
export const FeeData = proto.FeeData;
export const TransactionFeeSchedule = proto.TransactionFeeSchedule;
export const HederaFunctionality = proto.HederaFunctionality;
export const FeeSchedule = proto.FeeSchedule;