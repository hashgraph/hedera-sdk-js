import * as $protobuf from "@hashgraph/protobufjs/minimal.js";
import { proto } from "./proto.js";

// re-export protobuf reader for usage by @hashgraph/sdk
export const Reader = $protobuf.Reader;
export const Writer = $protobuf.Writer;

export const ConsensusService = proto.ConsensusService;
export const CryptoService = proto.CryptoService;
export const FileService = proto.FileService;
export const FreezeService = proto.FreezeService;
export const MirrorConsensusService = proto.MirrorConsensusService;
export const NetworkService = proto.NetworkService;
export const SmartContractService = proto.SmartContractService;
export const TokenService = proto.TokenService;

export const AccountID = proto.AccountID;
export const ContractGetInfoResponse = proto.ContractGetInfoResponse;
export const ContractID = proto.ContractID;
export const CryptoGetInfoResponse = proto.CryptoGetInfoResponse;
export const FileGetInfoResponse = proto.FileGetInfoResponse;
export const FileID = proto.FileID;
export const NetworkGetVersionInfoResponse = proto.NetworkGetVersionInfoResponse;
export const Query = proto.Query;
export const ResponseCodeEnum = proto.ResponseCodeEnum;
export const ResponseType = proto.ResponseType;
export const SemanticVersion = proto.SemanticVersion;
export const TokenID = proto.TokenID;
export const TopicID = proto.TopicID;
export const Transaction = proto.Transaction;
export const SignedTransaction = proto.SignedTransaction;
export const TransactionList = proto.TransactionList;
export const TransactionBody = proto.TransactionBody;
export const TransactionID = proto.TransactionID;
export const TransactionReceipt = proto.TransactionReceipt;
export const TransactionRecord = proto.TransactionRecord;
export const ConsensusTopicResponse = proto.ConsensusTopicResponse;
export const ConsensusTopicQuery = proto.ConsensusTopicQuery;
