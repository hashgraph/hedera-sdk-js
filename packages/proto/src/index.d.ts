import { proto } from "./proto.js";

import ConsensusService = proto.ConsensusService;
import CryptoService = proto.CryptoService;
import FileService = proto.FileService;
import FreezeService = proto.FreezeService;
import MirrorConsensusService = proto.MirrorConsensusService;
import NetworkService = proto.NetworkService;
import SmartContractService = proto.SmartContractService;
import TokenService = proto.TokenService;

export {
    ConsensusService,
    CryptoService,
    FileService,
    FreezeService,
    MirrorConsensusService,
    NetworkService,
    SmartContractService,
    TokenService,
};

import AccountID = proto.AccountID;
import ContractID = proto.ContractID;
import FileID = proto.FileID;
import Query = proto.Query;
import ResponseCodeEnum = proto.ResponseCodeEnum;
import TopicID = proto.TopicID;
import Transaction = proto.Transaction;
import TransactionBody = proto.TransactionBody;
import ResponseType = proto.ResponseType;

export { ResponseCodeEnum, Transaction, ResponseType, TransactionBody, Query, TopicID, FileID, AccountID, ContractID };

import IProxyStaker = proto.IProxyStaker;
import ILiveHash = proto.ILiveHash;
import ICryptoGetLiveHashResponse = proto.ICryptoGetLiveHashResponse;
import ICryptoGetLiveHashQuery = proto.ICryptoGetLiveHashQuery;
import ICryptoDeleteLiveHashTransactionBody = proto.ICryptoDeleteLiveHashTransactionBody;
import ICryptoAddLiveHashTransactionBody = proto.ICryptoAddLiveHashTransactionBody;
import ICryptoTransferTransactionBody = proto.ICryptoTransferTransactionBody;
import ICryptoUpdateTransactionBody = proto.ICryptoUpdateTransactionBody;
import ICryptoDeleteTransactionBody = proto.ICryptoDeleteTransactionBody;
import ICryptoCreateTransactionBody = proto.ICryptoCreateTransactionBody;
import IAllProxyStakers = proto.IAllProxyStakers;
import ICryptoGetStakersResponse = proto.ICryptoGetStakersResponse;
import ICryptoGetStakersQuery = proto.ICryptoGetStakersQuery;
import ICryptoGetAccountRecordsResponse = proto.ICryptoGetAccountRecordsResponse;
import ICryptoGetAccountRecordsQuery = proto.ICryptoGetAccountRecordsQuery;
import ICryptoGetInfoResponse = proto.ICryptoGetInfoResponse;
import ICryptoGetInfoQuery = proto.ICryptoGetInfoQuery;
import IAccountInfo = proto.CryptoGetInfoResponse.IAccountInfo;
import ICryptoGetAccountBalanceResponse = proto.ICryptoGetAccountBalanceResponse;
import ICryptoGetAccountBalanceQuery = proto.ICryptoGetAccountBalanceQuery;
import IAccountAmount = proto.IAccountAmount;
import IDuration = proto.IDuration;
import IContractFunctionResult = proto.IContractFunctionResult;
import IContractCallTransactionBody = proto.IContractCallTransactionBody;
import IContractCallLocalResponse = proto.IContractCallLocalResponse;
import IContractCallLocalQuery = proto.IContractCallLocalQuery;
import IContractGetBytecodeQuery = proto.IContractGetBytecodeQuery;
import IContractGetBytecodeResponse = proto.IContractGetBytecodeResponse;
import IAccountID = proto.IAccountID;
import IConsensusCreateTopicTransactionBody = proto.IConsensusCreateTopicTransactionBody;
import IConsensusDeleteTopicTransactionBody = proto.IConsensusDeleteTopicTransactionBody;
import IConsensusGetTopicInfoResponse = proto.IConsensusGetTopicInfoResponse;
import IConsensusSubmitMessageTransactionBody = proto.IConsensusSubmitMessageTransactionBody;
import IConsensusTopicInfo = proto.IConsensusTopicInfo;
import IConsensusTopicQuery = proto.IConsensusTopicQuery;
import IConsensusTopicResponse = proto.IConsensusTopicResponse;
import IConsensusUpdateTopicTransactionBody = proto.IConsensusUpdateTopicTransactionBody;
import IContractCreateTransactionBody = proto.IContractCreateTransactionBody;
import IContractDeleteTransactionBody = proto.IContractDeleteTransactionBody;
import IContractGetRecordsQuery = proto.IContractGetRecordsQuery;
import IContractGetRecordsResponse = proto.IContractGetRecordsResponse;
import IContractGetInfoQuery = proto.IContractGetInfoQuery;
import IContractGetInfoResponse = proto.IContractGetInfoResponse;
import IContractInfo = proto.ContractGetInfoResponse.IContractInfo;
import IContractID = proto.IContractID;
import IContractLoginfo = proto.IContractLoginfo;
import IContractUpdateTransactionBody = proto.IContractUpdateTransactionBody;
import IExchangeRate = proto.IExchangeRate;
import IExchangeRateSet = proto.IExchangeRateSet;
import IFileAppendTransactionBody = proto.IFileAppendTransactionBody;
import IFileContents = proto.FileGetContentsResponse.IFileContents;
import IFileCreateTransactionBody = proto.IFileCreateTransactionBody;
import IFileDeleteTransactionBody = proto.IFileDeleteTransactionBody;
import IFileGetContentsQuery = proto.IFileGetContentsQuery;
import IFileGetContentsResponse = proto.IFileGetContentsResponse;
import IFileGetInfoQuery = proto.IFileGetInfoQuery;
import IFileGetInfoResponse = proto.IFileGetInfoResponse;
import IFileID = proto.IFileID;
import IFileInfo = proto.FileGetInfoResponse.IFileInfo;
import IFileUpdateTransactionBody = proto.IFileUpdateTransactionBody;
import IKey = proto.IKey;
import IKeyList = proto.IKeyList;
import IQuery = proto.IQuery;
import IQueryHeader = proto.IQueryHeader;
import IResponse = proto.IResponse;
import IResponseHeader = proto.IResponseHeader;
import ITimestamp = proto.ITimestamp;
import ITopicID = proto.ITopicID;
import ITransaction = proto.ITransaction;
import ITransactionBody = proto.ITransactionBody;
import ITransactionGetReceiptQuery = proto.ITransactionGetReceiptQuery;
import ITransactionGetReceiptResponse = proto.ITransactionGetReceiptResponse;
import ITransactionID = proto.ITransactionID;
import ITransactionReceipt = proto.ITransactionReceipt;
import ITransactionRecord = proto.ITransactionRecord;
import ITransactionResponse = proto.ITransactionResponse;
import ITransactionGetRecordResponse = proto.ITransactionGetRecordResponse;
import ITransactionGetRecordQuery = proto.ITransactionGetRecordQuery;
import ISystemUndeleteTransactionBody = proto.ISystemUndeleteTransactionBody;
import ISystemDeleteTransactionBody = proto.ISystemDeleteTransactionBody;
import ISemanticVersion = proto.ISemanticVersion;
import INetworkGetVersionInfoResponse = proto.INetworkGetVersionInfoResponse;
import INetworkGetVersionInfoQuery = proto.INetworkGetVersionInfoQuery;
import IFreezeTransactionBody = proto.IFreezeTransactionBody;

// HTS Support
import ITokenAssociateTransactionBody = proto.ITokenAssociateTransactionBody;
import ITokenBurnTransactionBody = proto.ITokenBurnTransactionBody;
import ITokenCreateTransactionBody = proto.ITokenCreateTransactionBody;
import ITokenDeleteTransactionBody = proto.ITokenDeleteTransactionBody;
import ITokenDissociateTransactionBody = proto.ITokenDissociateTransactionBody;
import ITokenFreezeAccountTransactionBody = proto.ITokenFreezeAccountTransactionBody;
import ITokenGetInfoResponse = proto.ITokenGetInfoResponse;
import ITokenGrantKycTransactionBody = proto.ITokenGrantKycTransactionBody;
import ITokenID = proto.ITokenID;
import TokenID = proto.TokenID;
import ITokenInfo = proto.ITokenInfo;
import ITokenInfoQuery = proto.ITokenGetInfoQuery;
import ITokenMintTransactionBody = proto.ITokenMintTransactionBody;
import ITokenRevokeKycTransactionBody = proto.ITokenRevokeKycTransactionBody;
import ITokenTransfersTransactionBody = proto.ITokenTransfersTransactionBody;
import ITokenUnfreezeAccountTransactionBody = proto.ITokenUnfreezeAccountTransactionBody;
import ITokenUpdateTransactionBody = proto.ITokenUpdateTransactionBody;
import ITokenWipeAccountTransactionBody = proto.ITokenWipeAccountTransactionBody;

export {
    IAccountID,
    IConsensusCreateTopicTransactionBody,
    IConsensusDeleteTopicTransactionBody,
    IConsensusGetTopicInfoResponse,
    IConsensusSubmitMessageTransactionBody,
    IConsensusTopicInfo,
    IConsensusTopicQuery,
    IConsensusTopicResponse,
    IConsensusUpdateTopicTransactionBody,
    IContractCreateTransactionBody,
    IContractDeleteTransactionBody,
    IContractGetRecordsQuery,
    IContractGetRecordsResponse,
    IContractID,
    IContractLoginfo,
    IContractUpdateTransactionBody,
    IExchangeRate,
    IExchangeRateSet,
    IFileAppendTransactionBody,
    IAccountAmount,
    IFileContents,
    IFileCreateTransactionBody,
    IFileDeleteTransactionBody,
    IFileGetContentsQuery,
    IFileGetContentsResponse,
    IContractGetInfoQuery,
    IContractGetInfoResponse,
    IContractInfo,
    IFileGetInfoQuery,
    IFileGetInfoResponse,
    IFileID,
    IFileInfo,
    IFileUpdateTransactionBody,
    IKey,
    IKeyList,
    IQuery,
    IQueryHeader,
    IResponse,
    IResponseHeader,
    ITimestamp,
    ITopicID,
    ITransaction,
    ITransactionBody,
    ITransactionGetReceiptQuery,
    ITransactionGetReceiptResponse,
    ITransactionID,
    ITransactionReceipt,
    ITransactionRecord,
    ITransactionResponse,
    IDuration,
    IContractFunctionResult,
    IContractCallTransactionBody,
    IContractCallLocalResponse,
    IContractCallLocalQuery,
    IContractGetBytecodeQuery,
    IContractGetBytecodeResponse,
    IProxyStaker,
    ILiveHash,
    ICryptoGetLiveHashResponse,
    ICryptoGetLiveHashQuery,
    ICryptoDeleteLiveHashTransactionBody,
    ICryptoAddLiveHashTransactionBody,
    ICryptoTransferTransactionBody,
    ICryptoUpdateTransactionBody,
    ICryptoDeleteTransactionBody,
    ICryptoCreateTransactionBody,
    IAllProxyStakers,
    ICryptoGetStakersResponse,
    ICryptoGetStakersQuery,
    ICryptoGetAccountRecordsResponse,
    ICryptoGetAccountRecordsQuery,
    ICryptoGetInfoResponse,
    ICryptoGetInfoQuery,
    IAccountInfo,
    ICryptoGetAccountBalanceResponse,
    ICryptoGetAccountBalanceQuery,
    ITransactionGetRecordResponse,
    ITransactionGetRecordQuery,
    ISystemUndeleteTransactionBody,
    ISystemDeleteTransactionBody,
    ISemanticVersion,
    INetworkGetVersionInfoResponse,
    INetworkGetVersionInfoQuery,
    IFreezeTransactionBody,

    // HTS Support
    ITokenAssociateTransactionBody,
    ITokenBurnTransactionBody,
    ITokenCreateTransactionBody,
    ITokenDeleteTransactionBody,
    ITokenDissociateTransactionBody,
    ITokenFreezeAccountTransactionBody,
    ITokenGetInfoResponse,
    ITokenGrantKycTransactionBody,
    ITokenID,
    TokenID,
    ITokenInfo,
    ITokenInfoQuery,
    ITokenMintTransactionBody,
    ITokenRevokeKycTransactionBody,
    ITokenTransfersTransactionBody,
    ITokenUnfreezeAccountTransactionBody,
    ITokenUpdateTransactionBody,
    ITokenWipeAccountTransactionBody,
};
