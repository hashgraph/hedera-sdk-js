import proto from "@hashgraph/proto";
import Transaction from "./Transaction";
import Query from "./Query";
import ContractExecuteTransaction from "./contract/ContractExecuteTransaction";
import ContractCreateTransaction from "./contract/ContractCreateTransaction";
import ContractUpdateTransaction from "./contract/ContractUpdateTranscation";
import ContractDeleteTransaction from "./contract/ContractDeleteTransaction";
import AccountCreateTransaction from "./account/AccountCreateTransaction";
import AccountDeleteTransaction from "./account/AccountDeleteTransaction";
import CryptoTransferTransaction from "./account/CryptoTransferTransaction";
import AccountUpdateTransaction from "./account/AccountUpdateTransaction";
import LiveHashAddTransaction from "./account/LiveHashAddTransaction";
import LiveHashDeleteTransaction from "./account/LiveHashDeleteTransaction";
import FileAppendTransaction from "./file/FileAppendTransaction";
import FileCreateTransaction from "./file/FileCreateTransaction";
import FileDeleteTransaction from "./file/FileDeleteTransaction";
import FileUpdateTransaction from "./file/FileUpdateTransaction";
import TopicCreateTransaction from "./topic/TopicCreateTransaction";
import TopicUpdateTransaction from "./topic/TopicUpdateTransaction";
import TopicDeleteTransaction from "./topic/TopicDeleteTransacton";
import TopicMessageSubmitTransaction from "./topic/TopicMessageSubmitTransaction";
import SystemDeleteTransaction from "./SystemDeleteTransaction";
import SystemUndeleteTransaction from "./SystemUndeleteTransaction";
import FreezeTransaction from "./FreezeTransaction";
import ContractCallQuery from "./contract/ContractCallQuery";
import NetworkVersionInfoQuery from "./NetworkVersionInfoQuery";
import TopicInfoQuery from "./topic/TopicInfoQuery";
import TransactionRecordQuery from "./TransactionRecordQuery";
import TransactionReceiptQuery from "./TransactionReceiptQuery";
import FileInfoQuery from "./file/FileInfoQuery";
import FileContentsQuery from "./file/FileContentsQuery";
import AccountStakersQuery from "./account/AccountStakersQuery";
import LiveHashQuery from "./account/LiveHashQuery";
import AccountInfoQuery from "./account/AccountInfoQuery";
import AccountBalanceQuery from "./account/AccountBalanceQuery";
import AccountRecordsQuery from "./account/AccountRecordsQuery";
import ContractRecordQuery from "./contract/ContractRecordsQuery";
import ContractByteCodeQuery from "./contract/ContractByteCodeQuery";
import ContractInfoQuery from "./contract/ContractInfoQuery";

/**
 * @param {Uint8Array} bytes
 * @returns {Transaction}
 */
// @ts-ignore
Transaction.fromBytes = function (bytes) {
    const transaction = proto.Transaction.decode(bytes);
    const isFrozen = transaction.sigMap?.sigPair?.length ?? 0 > 0;
    const body = proto.TransactionBody.decode(transaction.bodyBytes);

    /**
     * @type {Transaction}
     */
    let instance;

    switch (body.data) {
        case "contractCall":
            instance = ContractExecuteTransaction._fromProtobuf(body);
            break;
        case "contractCreateInstance":
            instance = ContractCreateTransaction._fromProtobuf(body);
            break;
        case "contractUpdateInstance":
            instance = ContractUpdateTransaction._fromProtobuf(body);
            break;
        case "contractDeleteInstance":
            instance = ContractDeleteTransaction._fromProtobuf(body);
            break;
        case "cryptoAddLiveHash":
            instance = LiveHashAddTransaction._fromProtobuf(body);
            break;
        case "cryptoCreateAccount":
            instance = AccountCreateTransaction._fromProtobuf(body);
            break;
        case "cryptoDelete":
            instance = AccountDeleteTransaction._fromProtobuf(body);
            break;
        case "cryptoDeleteLiveHash":
            instance = LiveHashDeleteTransaction._fromProtobuf(body);
            break;
        case "cryptoTransfer":
            instance = CryptoTransferTransaction._fromProtobuf(body);
            break;
        case "cryptoUpdateAccount":
            instance = AccountUpdateTransaction._fromProtobuf(body);
            break;
        case "fileAppend":
            instance = FileAppendTransaction._fromProtobuf(body);
            break;
        case "fileCreate":
            instance = FileCreateTransaction._fromProtobuf(body);
            break;
        case "fileDelete":
            instance = FileDeleteTransaction._fromProtobuf(body);
            break;
        case "fileUpdate":
            instance = FileUpdateTransaction._fromProtobuf(body);
            break;
        case "systemDelete":
            instance = SystemDeleteTransaction._fromProtobuf(body);
            break;
        case "systemUndelete":
            instance = SystemUndeleteTransaction._fromProtobuf(body);
            break;
        case "freeze":
            instance = FreezeTransaction._fromProtobuf(body);
            break;
        case "consensusCreateTopic":
            instance = TopicCreateTransaction._fromProtobuf(body);
            break;
        case "consensusUpdateTopic":
            instance = TopicUpdateTransaction._fromProtobuf(body);
            break;
        case "consensusDeleteTopic":
            instance = TopicDeleteTransaction._fromProtobuf(body);
            break;
        case "consensusSubmitMessage":
            instance = TopicMessageSubmitTransaction._fromProtobuf(body);
            break;
        default:
            throw new Error(
                `(BUG) Transaction.fromBytes() not implemented for type ${
                    body.data ?? ""
                }`
            );
    }

    if (isFrozen) {
        // FIXME: convert this to JS
        // instance.signatures = Collections.singletonList(tx.getSigMap().toBuilder());
        instance._transactions = [transaction];
    }

    return instance;
};

/**
 * @template T
 * @param {Uint8Array} bytes
 * @returns {Query<T>}
 */
// @ts-ignore
Query.fromBytes = function (bytes) {
    const query = proto.Query.decode(bytes);

    let instance;
    switch (query.query) {
        case "contractCallLocal":
            instance = ContractCallQuery._fromProtobuf(query);
            break;
        case "contractGetInfo":
            instance = ContractInfoQuery._fromProtobuf(query);
            break;
        case "contractGetBytecode":
            instance = ContractByteCodeQuery._fromProtobuf(query);
            break;
        case "ContractGetRecords":
            instance = ContractRecordQuery._fromProtobuf(query);
            break;
        case "cryptogetAccountBalance":
            instance = AccountBalanceQuery._fromProtobuf(query);
            break;
        case "cryptoGetAccountRecords":
            instance = AccountRecordsQuery._fromProtobuf(query);
            break;
        case "cryptoGetInfo":
            instance = AccountInfoQuery._fromProtobuf(query);
            break;
        case "cryptoGetLiveHash":
            instance = LiveHashQuery._fromProtobuf(query);
            break;
        case "cryptoGetProxyStakers":
            instance = AccountStakersQuery._fromProtobuf(query);
            break;
        case "fileGetContents":
            instance = FileContentsQuery._fromProtobuf(query);
            break;
        case "fileGetInfo":
            instance = FileInfoQuery._fromProtobuf(query);
            break;
        case "transactionGetReceipt":
            instance = TransactionReceiptQuery._fromProtobuf(query);
            break;
        case "transactionGetRecord":
            instance = TransactionRecordQuery._fromProtobuf(query);
            break;
        case "transactionGetFastRecord":
            instance = TransactionRecordQuery._fromProtobuf(query);
            break;
        case "consensusGetTopicInfo":
            instance = TopicInfoQuery._fromProtobuf(query);
            break;
        case "networkGetVersionInfo":
            instance = NetworkVersionInfoQuery._fromProtobuf(query);
            break;
        default:
            throw new Error(
                `(BUG) Query.fromBytes() not implemented for type ${
                    query.query ?? ""
                }`
            );
    }

    return /** @type {Query<T>} */ (/** @type {unknown} */ (instance));
};

export * from "@hashgraph/cryptography";

export { default as AccountBalanceQuery } from "./account/AccountBalanceQuery";
export { default as AccountCreateTransaction } from "./account/AccountCreateTransaction";
export { default as AccountDeleteTransaction } from "./account/AccountDeleteTransaction";
export { default as AccountId } from "./account/AccountId";
export { default as AccountInfo } from "./account/AccountInfo";
export { default as AccountInfoQuery } from "./account/AccountInfoQuery";
export { default as AccountRecordsQuery } from "./account/AccountRecordsQuery";
export { default as AccountStakersQuery } from "./account/AccountStakersQuery";
export { default as AccountUpdateTransaction } from "./account/AccountUpdateTransaction";
export { default as Client } from "./Client";
export { default as ContractByteCodeQuery } from "./contract/ContractByteCodeQuery";
export { default as ContractCallQuery } from "./contract/ContractCallQuery";
export { default as ContractCreateTransaction } from "./contract/ContractCreateTransaction";
export { default as ContractDeleteTransaction } from "./contract/ContractDeleteTransaction";
export { default as ContractExecuteTransaction } from "./contract/ContractExecuteTransaction";
export { default as ContractFunctionParameters } from "./contract/ContractFunctionParameters";
export { default as ContractFunctionResult } from "./contract/ContractFunctionResult";
export { default as ContractFunctionSelector } from "./contract/ContractFunctionSelector";
export { default as ContractId } from "./contract/ContractId";
export { default as ContractInfo } from "./contract/ContractInfo";
export { default as ContractInfoQuery } from "./contract/ContractInfoQuery";
export { default as ContractLogInfo } from "./contract/ContractLogInfo";
export { default as ContractRecordsQuery } from "./contract/ContractRecordsQuery";
export { default as ContractUpdateTranscation } from "./contract/ContractUpdateTranscation";
export { default as CryptoTransferTransaction } from "./account/CryptoTransferTransaction";
export { default as ExchangeRate } from "./ExchangeRate";
export { default as FileAppendTransaction } from "./file/FileAppendTransaction";
export { default as FileContentsQuery } from "./file/FileContentsQuery";
export { default as FileCreateTransaction } from "./file/FileCreateTransaction";
export { default as FileDeleteTransaction } from "./file/FileDeleteTransaction";
export { default as FileId } from "./file/FileId";
export { default as FileInfo } from "./file/FileInfo";
export { default as FileInfoQuery } from "./file/FileInfoQuery";
export { default as FileUpdateTransaction } from "./file/FileUpdateTransaction";
export { default as FreezeTransaction } from "./FreezeTransaction";
export { default as Hbar } from "./Hbar";
export { default as HbarUnit } from "./HbarUnit";
export { default as LiveHash } from "./account/LiveHash";
export { default as LiveHashAddTransaction } from "./account/LiveHashAddTransaction";
export { default as LiveHashDeleteTransaction } from "./account/LiveHashDeleteTransaction";
export { default as LiveHashQuery } from "./account/LiveHashQuery";
export { default as NetworkVersionInfo } from "./NetworkVersionInfo";
export { default as NetworkVersionInfoQuery } from "./NetworkVersionInfoQuery";
export { default as ProxyStaker } from "./account/ProxyStaker";
export { default as Query } from "./Query";
export { default as SemanticVersion } from "./SemanticVersion";
export { default as Status } from "./Status";
export { default as SystemDeleteTransaction } from "./SystemDeleteTransaction";
export { default as SystemUndeleteTransaction } from "./SystemUndeleteTransaction";
export { default as Timestamp } from "./Timestamp";
export { default as TopicCreateTransaction } from "./topic/TopicCreateTransaction";
export { default as TopicDeleteTransacton } from "./topic/TopicDeleteTransacton";
export { default as TopicId } from "./topic/TopicId";
export { default as TopicInfo } from "./topic/TopicInfo";
export { default as TopicInfoQuery } from "./topic/TopicInfoQuery";
export { default as TopicMessage } from "./topic/TopicMessage";
export { default as TopicMessageChunk } from "./topic/TopicMessageChunk";
export { default as TopicMessageSubmitTransaction } from "./topic/TopicMessageSubmitTransaction";
export { default as TopicUpdateTransaction } from "./topic/TopicUpdateTransaction";
export { default as Transaction } from "./Transaction";
export { default as TransactionId } from "./TransactionId";
export { default as TransactionReceipt } from "./TransactionReceipt";
export { default as TransactionReceiptQuery } from "./TransactionReceiptQuery";
export { default as TransactionRecord } from "./TransactionRecord";
export { default as TransactionRecordQuery } from "./TransactionRecordQuery";
export { default as TransactionResponse } from "./TransactionResponse";
export { default as Transfer } from "./Transfer";
