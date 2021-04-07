import ScheduleId from "./ScheduleId.js";
import AccountId from "../account/AccountId.js";
import {
    keyFromProtobuf,
    keyToProtobuf,
    keyListFromProtobuf,
    keyListToProtobuf,
} from "../cryptography/protobuf.js";
import Timestamp from "../Timestamp.js";
// import Transaction from "../transaction/Transaction.js";
// import {
//     SignedTransaction as ProtoSignedTransaction,
//     TransactionList as ProtoTransactionList,
// } from "@hashgraph/proto";
import TransactionId from "../transaction/TransactionId.js";
import {
    AccountCreateTransaction,
    AccountDeleteTransaction,
    AccountUpdateTransaction,
    ContractCreateTransaction,
    ContractDeleteTransaction,
    ContractExecuteTransaction,
    FileAppendTransaction,
    FileCreateTransaction,
    FileDeleteTransaction,
    FileUpdateTransaction,
    ScheduleDeleteTransaction,
    SystemDeleteTransaction,
    SystemUndeleteTransaction,
    TokenAssociateTransaction,
    TokenBurnTransaction,
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenDissociateTransaction,
    TokenFreezeTransaction,
    TokenGrantKycTransaction,
    TokenMintTransaction,
    TokenRevokeKycTransaction,
    TokenUnfreezeTransaction,
    TokenUpdateTransaction,
    TokenWipeTransaction,
    TopicCreateTransaction,
    TopicDeleteTransaction,
    TopicMessageSubmitTransaction,
    TopicUpdateTransaction,
    Transaction,
    TransferTransaction,
} from "../exports";
import TopicId from "../topic/TopicId";
import TokenId from "../token/TokenId";
import Hbar from "../Hbar";
import FileId from "../file/FileId";
import ContractId from "../contract/ContractId";
import ContractUpdateTransaction from "../contract/ContractUpdateTranscation";
import Duration from "../Duration";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IScheduleInfo} proto.IScheduleInfo
 * @typedef {import("@hashgraph/proto").IScheduleID} proto.IScheduleID
 * @typedef {import("@hashgraph/proto").ITimestamp} proto.ITimestamp
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").IScheduleID} proto.IScheduledID
 * @typedef {import("@hashgraph/proto").IFileID} proto.IFileID
 * @typedef {import("@hashgraph/proto").IContractID} proto.IContractID
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IKey} proto.IKey
 * @typedef {import("@hashgraph/proto").IDuration} proto.IDuration
 * @typedef {import("@hashgraph/proto").ISchedulableTransactionBody} proto.ISchedulableTransactionBody
 */

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("@hashgraph/cryptography").KeyList} KeyList
 */

/**
 * Response when the client sends the node ScheduleGetInfoQuery.
 */
export default class ScheduleInfo {
    /**
     * @private
     * @param {object} props
     * @param {ScheduleId} props.scheduleId;
     * @param {?AccountId} props.creatorAccountID;
     * @param {?AccountId} props.payerAccountID;
     * @param {?proto.ISchedulableTransactionBody} props.schedulableTransactionBody;
     * @param {?Key} props.adminKey
     * @param {?KeyList} props.signers;
     * @param {?string} props.scheduleMemo;
     * @param {?Timestamp} props.expirationTime;
     * @param {?Timestamp} props.executed;
     * @param {?Timestamp} props.deleted;
     * @param {?TransactionId} props.scheduledTransactionId;
     */
    constructor(props) {
        /**
         *
         * @readonly
         */
        this.scheduleId = props.scheduleId;

        /**
         *
         * @readonly
         */
        this.creatorAccountId = props.creatorAccountID;

        /**
         *
         * @readonly
         */
        this.payerAccountId = props.payerAccountID;

        /**
         *
         * @readonly
         */
        this.schedulableTransactionBody = props.schedulableTransactionBody;

        /**
         *
         * @readonly
         */
        this.signers = props.signers;

        /**
         *
         * @readonly
         */
        this.scheduleMemo = props.scheduleMemo;

        /**
         *
         * @readonly
         */
        this.adminKey = props.adminKey != null ? props.adminKey : null;

        /**
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         *
         * @readonly
         */
        this.executed = props.executed;

        /**
         *
         * @readonly
         */
        this.deleted = props.deleted;

        this.scheduledTransactionId = props.scheduledTransactionId;
    }

    /**
     * @internal
     * @param {proto.IScheduleInfo} info
     * @returns {ScheduleInfo}
     */
    static _fromProtobuf(info) {
        return new ScheduleInfo({
            scheduleId: ScheduleId._fromProtobuf(
                /** @type {proto.IScheduleID} */ (info.scheduleID)
            ),
            creatorAccountID:
                info.creatorAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (info.creatorAccountID)
                      )
                    : null,
            payerAccountID:
                info.payerAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (info.payerAccountID)
                      )
                    : null,
            schedulableTransactionBody:
                info.scheduledTransactionBody != null
                    ? info.scheduledTransactionBody
                    : null,
            adminKey:
                info.adminKey != null ? keyFromProtobuf(info.adminKey) : null,
            signers:
                info.signers != null ? keyListFromProtobuf(info.signers) : null,
            scheduleMemo: info.memo != null ? info.memo : null,
            expirationTime:
                info.expirationTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.expirationTime)
                      )
                    : null,
            executed:
                info.executionTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.executionTime)
                      )
                    : null,
            deleted:
                info.deletionTime != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.deletionTime)
                      )
                    : null,
            scheduledTransactionId:
                info.scheduledTransactionID != null
                    ? TransactionId._fromProtobuf(info.scheduledTransactionID)
                    : null,
        });
    }

    /**
     * @returns {proto.IScheduleInfo}
     */
    _toProtobuf() {
        return {
            scheduleID:
                this.scheduleId != null ? this.scheduleId._toProtobuf() : null,
            creatorAccountID:
                this.creatorAccountId != null
                    ? this.creatorAccountId._toProtobuf()
                    : null,
            payerAccountID:
                this.payerAccountId != null
                    ? this.payerAccountId._toProtobuf()
                    : null,
            scheduledTransactionBody:
                this.schedulableTransactionBody != null
                    ? this.schedulableTransactionBody
                    : null,
            adminKey:
                this.adminKey != null ? keyToProtobuf(this.adminKey) : null,
            signers:
                this.signers != null ? keyListToProtobuf(this.signers) : null,
            memo: this.scheduleMemo != null ? this.scheduleMemo : "",
            expirationTime:
                this.expirationTime != null
                    ? this.expirationTime._toProtobuf()
                    : null,
            scheduledTransactionID:
                this.scheduledTransactionId != null
                    ? this.scheduledTransactionId._toProtobuf()
                    : null,
        };
    }

    /**
     * @returns {Transaction}
     */
    get transaction() {
        const body = this.schedulableTransactionBody;
        if (body == null) throw "Scheduled transaction body is empty";

        if (body.consensusCreateTopic != null) {
            return new TopicCreateTransaction({
                adminKey:
                    body.consensusCreateTopic.adminKey != null
                        ? keyFromProtobuf(body.consensusCreateTopic.adminKey)
                        : undefined,
                submitKey:
                    body.consensusCreateTopic.submitKey != null
                        ? keyFromProtobuf(body.consensusCreateTopic.submitKey)
                        : undefined,
                autoRenewAccountId:
                    body.consensusCreateTopic.autoRenewAccount != null
                        ? AccountId._fromProtobuf(
                              body.consensusCreateTopic.autoRenewAccount
                          )
                        : undefined,
                autoRenewPeriod:
                    body.consensusCreateTopic.autoRenewPeriod != null
                        ? body.consensusCreateTopic.autoRenewPeriod.seconds !=
                          null
                            ? body.consensusCreateTopic.autoRenewPeriod.seconds
                            : undefined
                        : undefined,
                topicMemo:
                    body.consensusCreateTopic.memo != null
                        ? body.consensusCreateTopic.memo
                        : undefined,
            });
        } else if (body.consensusDeleteTopic != null) {
            return new TopicDeleteTransaction({
                topicId:
                    body.consensusDeleteTopic.topicID != null
                        ? TopicId._fromProtobuf(
                              body.consensusDeleteTopic.topicID
                          )
                        : undefined,
            });
        } else if (body.consensusUpdateTopic) {
            return new TopicUpdateTransaction({
                topicId:
                    body.consensusUpdateTopic.topicID != null
                        ? TopicId._fromProtobuf(
                              body.consensusUpdateTopic.topicID
                          )
                        : undefined,
                adminKey:
                    body.consensusUpdateTopic.adminKey != null
                        ? keyFromProtobuf(body.consensusUpdateTopic.adminKey)
                        : undefined,
                submitKey:
                    body.consensusUpdateTopic.submitKey != null
                        ? keyFromProtobuf(body.consensusUpdateTopic.submitKey)
                        : undefined,
                autoRenewAccountId:
                    body.consensusUpdateTopic.autoRenewAccount != null
                        ? AccountId._fromProtobuf(
                              body.consensusUpdateTopic.autoRenewAccount
                          )
                        : undefined,
                autoRenewPeriod:
                    body.consensusUpdateTopic.autoRenewPeriod != null
                        ? body.consensusUpdateTopic.autoRenewPeriod.seconds !=
                          null
                            ? body.consensusUpdateTopic.autoRenewPeriod.seconds
                            : undefined
                        : undefined,
                topicMemo:
                    body.consensusUpdateTopic.memo != null
                        ? body.consensusUpdateTopic.memo.value != null
                            ? body.consensusUpdateTopic.memo.value
                            : undefined
                        : undefined,
            });
        } else if (body.consensusSubmitMessage != null) {
            return new TopicMessageSubmitTransaction({
                topicId:
                    body.consensusSubmitMessage.topicID != null
                        ? TopicId._fromProtobuf(
                              body.consensusSubmitMessage.topicID
                          )
                        : undefined,
                message:
                    body.consensusSubmitMessage.message != null
                        ? body.consensusSubmitMessage.message
                        : undefined,
            });
        } else if (body.cryptoCreateAccount != null) {
            return new AccountCreateTransaction({
                key:
                    body.cryptoCreateAccount.key != null
                        ? keyFromProtobuf(body.cryptoCreateAccount.key)
                        : undefined,
                initialBalance:
                    body.cryptoCreateAccount.initialBalance != null
                        ? body.cryptoCreateAccount.initialBalance
                        : undefined,
                receiverSignatureRequired:
                    body.cryptoCreateAccount.receiverSigRequired != null
                        ? body.cryptoCreateAccount.receiverSigRequired
                        : undefined,
                proxyAccountId:
                    body.cryptoCreateAccount.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .cryptoCreateAccount.proxyAccountID)
                          )
                        : undefined,
                autoRenewPeriod:
                    body.cryptoCreateAccount.autoRenewPeriod != null
                        ? body.cryptoCreateAccount.autoRenewPeriod.seconds !=
                          null
                            ? body.cryptoCreateAccount.autoRenewPeriod.seconds
                            : undefined
                        : undefined,
                accountMemo:
                    body.cryptoCreateAccount.memo != null
                        ? body.cryptoCreateAccount.memo
                        : undefined,
            });
        } else if (body.cryptoDelete != null) {
            return new AccountDeleteTransaction({
                accountId:
                    body.cryptoDelete.deleteAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body.cryptoDelete
                                  .deleteAccountID)
                          )
                        : undefined,
                transferAccountId:
                    body.cryptoDelete.transferAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body.cryptoDelete
                                  .transferAccountID)
                          )
                        : undefined,
            });
        } else if (body.cryptoTransfer != null) {
            const transfers = new TransferTransaction();
            for (const list of body.cryptoTransfer.tokenTransfers != null
                ? body.cryptoTransfer.tokenTransfers
                : []) {
                const tokenId = TokenId._fromProtobuf(
                    /** @type {proto.ITokenID} */ (list.token)
                );

                for (const transfer of list.transfers != null
                    ? list.transfers
                    : []) {
                    transfers.addTokenTransfer(
                        tokenId,
                        AccountId._fromProtobuf(
                            /** @type {proto.IAccountID} */ (transfer.accountID)
                        ),
                        /** @type {Long} */ (transfer.amount)
                    );
                }
            }

            const accountAmounts =
                body.cryptoTransfer.transfers != null
                    ? body.cryptoTransfer.transfers.accountAmounts != null
                        ? body.cryptoTransfer.transfers.accountAmounts
                        : []
                    : [];

            for (const aa of accountAmounts) {
                transfers.addHbarTransfer(
                    AccountId._fromProtobuf(
                        /** @type {proto.IAccountID} */ (aa.accountID)
                    ),
                    Hbar.fromTinybars(/** @type {Long} */ (aa.amount))
                );
            }
            return transfers;
        } else if (body.cryptoUpdateAccount) {
            return new AccountUpdateTransaction({
                accountId:
                    body.cryptoUpdateAccount.accountIDToUpdate != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .cryptoUpdateAccount.accountIDToUpdate)
                          )
                        : undefined,
                key:
                    body.cryptoUpdateAccount.key != null
                        ? keyFromProtobuf(body.cryptoUpdateAccount.key)
                        : undefined,
                receiverSignatureRequired:
                    body.cryptoUpdateAccount.receiverSigRequired != null
                        ? body.cryptoUpdateAccount.receiverSigRequired
                        : undefined,
                proxyAccountId:
                    body.cryptoUpdateAccount.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .cryptoUpdateAccount.proxyAccountID)
                          )
                        : undefined,
                autoRenewPeriod:
                    body.cryptoUpdateAccount.autoRenewPeriod != null
                        ? body.cryptoUpdateAccount.autoRenewPeriod.seconds !=
                          null
                            ? body.cryptoUpdateAccount.autoRenewPeriod.seconds
                            : undefined
                        : undefined,
                expirationTime:
                    body.cryptoUpdateAccount.expirationTime != null
                        ? Timestamp._fromProtobuf(
                              body.cryptoUpdateAccount.expirationTime
                          )
                        : undefined,
                accountMemo:
                    body.cryptoUpdateAccount.memo != null
                        ? body.cryptoUpdateAccount.memo.value != null
                            ? body.cryptoUpdateAccount.memo.value
                            : undefined
                        : undefined,
            });
        } else if (body.contractCreateInstance) {
            return new ContractCreateTransaction({
                bytecodeFileId:
                    body.contractCreateInstance.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {proto.IFileID} */ (body
                                  .contractCreateInstance.fileID)
                          )
                        : undefined,
                adminKey:
                    body.contractCreateInstance.adminKey != null
                        ? keyFromProtobuf(body.contractCreateInstance.adminKey)
                        : undefined,
                gas:
                    body.contractCreateInstance.gas != null
                        ? body.contractCreateInstance.gas
                        : undefined,
                initialBalance:
                    body.contractCreateInstance.initialBalance != null
                        ? body.contractCreateInstance.initialBalance
                        : undefined,
                proxyAccountId:
                    body.contractCreateInstance.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .contractCreateInstance.proxyAccountID)
                          )
                        : undefined,
                autoRenewPeriod:
                    body.contractCreateInstance.autoRenewPeriod != null
                        ? body.contractCreateInstance.autoRenewPeriod.seconds !=
                          null
                            ? body.contractCreateInstance.autoRenewPeriod
                                  .seconds
                            : undefined
                        : undefined,
                constructorParameters:
                    body.contractCreateInstance.constructorParameters != null
                        ? body.contractCreateInstance.constructorParameters
                        : undefined,
                contractMemo:
                    body.contractCreateInstance.memo != null
                        ? body.contractCreateInstance.memo
                        : undefined,
            });
        } else if (body.contractDeleteInstance) {
            return new ContractDeleteTransaction({
                contractId:
                    body.contractDeleteInstance.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .contractDeleteInstance.contractID)
                          )
                        : undefined,
                transferAccountId:
                    body.contractDeleteInstance.transferAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .contractDeleteInstance.transferAccountID)
                          )
                        : undefined,
                transferContractId:
                    body.contractDeleteInstance.transferContractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .contractDeleteInstance.transferContractID)
                          )
                        : undefined,
            });
        } else if (body.contractCall != null) {
            return new ContractExecuteTransaction({
                contractId:
                    body.contractCall.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .contractCall.contractID)
                          )
                        : undefined,
                gas:
                    body.contractCall.gas != null
                        ? body.contractCall.gas
                        : undefined,
                amount: body.contractCall.amount
                    ? body.contractCall.amount
                    : undefined,
                functionParameters:
                    body.contractCall.functionParameters != null
                        ? body.contractCall.functionParameters
                        : undefined,
            });
        } else if (body.contractUpdateInstance != null) {
            return new ContractUpdateTransaction({
                contractId:
                    body.contractUpdateInstance.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .contractUpdateInstance.contractID)
                          )
                        : undefined,
                bytecodeFileId:
                    body.contractUpdateInstance.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {proto.IFileID} */ (body
                                  .contractUpdateInstance.fileID)
                          )
                        : undefined,
                expirationTime:
                    body.contractUpdateInstance.expirationTime != null
                        ? Timestamp._fromProtobuf(
                              body.contractUpdateInstance.expirationTime
                          )
                        : undefined,
                adminKey:
                    body.contractUpdateInstance.adminKey != null
                        ? keyFromProtobuf(body.contractUpdateInstance.adminKey)
                        : undefined,
                proxyAccountId:
                    body.contractUpdateInstance.proxyAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {proto.IAccountID} */ (body
                                  .contractUpdateInstance.proxyAccountID)
                          )
                        : undefined,
                autoRenewPeriod:
                    body.contractUpdateInstance.autoRenewPeriod != null
                        ? body.contractUpdateInstance.autoRenewPeriod.seconds !=
                          null
                            ? body.contractUpdateInstance.autoRenewPeriod
                                  .seconds
                            : undefined
                        : undefined,
                contractMemo:
                    body.contractUpdateInstance.memoWrapper != null
                        ? body.contractUpdateInstance.memoWrapper.value != null
                            ? body.contractUpdateInstance.memoWrapper.value
                            : undefined
                        : undefined,
            });
        } else if (body.fileCreate) {
            return new FileCreateTransaction({
                keys:
                    body.fileCreate.keys != null
                        ? body.fileCreate.keys.keys != null
                            ? body.fileCreate.keys.keys.map((key) =>
                                  keyFromProtobuf(key)
                              )
                            : undefined
                        : undefined,
                expirationTime:
                    body.fileCreate.expirationTime != null
                        ? Timestamp._fromProtobuf(
                              body.fileCreate.expirationTime
                          )
                        : undefined,
                contents:
                    body.fileCreate.contents != null
                        ? body.fileCreate.contents
                        : undefined,
                fileMemo:
                    body.fileCreate.memo != null
                        ? body.fileCreate.memo
                        : undefined,
            });
        } else if (body.fileDelete != null) {
            return new FileDeleteTransaction({
                fileId:
                    body.fileDelete.fileID != null
                        ? FileId._fromProtobuf(body.fileDelete.fileID)
                        : undefined,
            });
        } else if (body.fileAppend) {
            new FileAppendTransaction({
                fileId:
                    body.fileAppend.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {proto.IFileID} */ (body.fileAppend
                                  .fileID)
                          )
                        : undefined,
                contents:
                    body.fileAppend.contents != null
                        ? body.fileAppend.contents
                        : undefined,
            });
        } else if (body.fileUpdate) {
            return new FileUpdateTransaction({
                fileId:
                    body.fileUpdate.fileID != null
                        ? FileId._fromProtobuf(body.fileUpdate.fileID)
                        : undefined,
                keys:
                    body.fileUpdate.keys != null
                        ? body.fileUpdate.keys.keys != null
                            ? body.fileUpdate.keys.keys.map((key) =>
                                  keyFromProtobuf(key)
                              )
                            : undefined
                        : undefined,
                expirationTime:
                    body.fileUpdate.expirationTime != null
                        ? Timestamp._fromProtobuf(
                              body.fileUpdate.expirationTime
                          )
                        : undefined,
                contents:
                    body.fileUpdate.contents != null
                        ? body.fileUpdate.contents
                        : undefined,
                fileMemo:
                    body.fileUpdate.memo != null
                        ? body.fileUpdate.memo.value != null
                            ? body.fileUpdate.memo.value
                            : undefined
                        : undefined,
            });
        } else if (body.systemDelete != null) {
            return new SystemDeleteTransaction({
                fileId:
                    body.systemDelete.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {proto.IFileID} */ (body.systemDelete
                                  .fileID)
                          )
                        : undefined,
                contractId:
                    body.systemDelete.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .systemDelete.contractID)
                          )
                        : undefined,
                expirationTime:
                    body.systemDelete.expirationTime != null
                        ? Timestamp._fromProtobuf(
                              body.systemDelete.expirationTime
                          )
                        : undefined,
            });
        } else if (body.systemUndelete != null) {
            return new SystemUndeleteTransaction({
                fileId:
                    body.systemUndelete.fileID != null
                        ? FileId._fromProtobuf(
                              /** @type {proto.IFileID} */ (body.systemUndelete
                                  .fileID)
                          )
                        : undefined,
                contractId:
                    body.systemUndelete.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (body
                                  .systemUndelete.contractID)
                          )
                        : undefined,
            });
        } else if (body.scheduleDelete != null) {
            return new ScheduleDeleteTransaction({
                scheduleId:
                    body.scheduleDelete.scheduleID != null
                        ? ScheduleId._fromProtobuf(
                              /** @type {proto.IScheduleID} */ (body
                                  .scheduleDelete.scheduleID)
                          )
                        : undefined,
            });
        } else if (body.tokenAssociate != null) {
            return new TokenAssociateTransaction({
                tokenIds:
                    body.tokenAssociate.tokens != null
                        ? body.tokenAssociate.tokens.map((token) =>
                              TokenId._fromProtobuf(token)
                          )
                        : undefined,
                accountId:
                    body.tokenAssociate.account != null
                        ? AccountId._fromProtobuf(body.tokenAssociate.account)
                        : undefined,
            });
        } else if (body.tokenBurn != null) {
            return new TokenBurnTransaction({
                tokenId:
                    body.tokenBurn.token != null
                        ? TokenId._fromProtobuf(body.tokenBurn.token)
                        : undefined,
                amount:
                    body.tokenBurn.amount != null
                        ? body.tokenBurn.amount
                        : undefined,
            });
        } else if (body.tokenCreation != null) {
            return new TokenCreateTransaction({
                tokenName:
                    body.tokenCreation.name != null
                        ? body.tokenCreation.name
                        : undefined,
                tokenSymbol:
                    body.tokenCreation.symbol != null
                        ? body.tokenCreation.symbol
                        : undefined,
                decimals:
                    body.tokenCreation.decimals != null
                        ? body.tokenCreation.decimals
                        : undefined,
                initialSupply:
                    body.tokenCreation.initialSupply != null
                        ? body.tokenCreation.initialSupply
                        : undefined,
                treasuryAccountId:
                    body.tokenCreation.treasury != null
                        ? AccountId._fromProtobuf(body.tokenCreation.treasury)
                        : undefined,
                adminKey:
                    body.tokenCreation.adminKey != null
                        ? keyFromProtobuf(body.tokenCreation.adminKey)
                        : undefined,
                kycKey:
                    body.tokenCreation.kycKey != null
                        ? keyFromProtobuf(body.tokenCreation.kycKey)
                        : undefined,
                freezeKey:
                    body.tokenCreation.freezeKey != null
                        ? keyFromProtobuf(body.tokenCreation.freezeKey)
                        : undefined,
                wipeKey:
                    body.tokenCreation.wipeKey != null
                        ? keyFromProtobuf(body.tokenCreation.wipeKey)
                        : undefined,
                supplyKey:
                    body.tokenCreation.supplyKey != null
                        ? keyFromProtobuf(body.tokenCreation.supplyKey)
                        : undefined,
                freezeDefault:
                    body.tokenCreation.freezeDefault != null
                        ? body.tokenCreation.freezeDefault
                        : undefined,
                autoRenewAccountId:
                    body.tokenCreation.autoRenewAccount != null
                        ? AccountId._fromProtobuf(
                              body.tokenCreation.autoRenewAccount
                          )
                        : undefined,
                expirationTime:
                    body.tokenCreation.expiry != null
                        ? Timestamp._fromProtobuf(body.tokenCreation.expiry)
                        : undefined,
                autoRenewPeriod:
                    body.tokenCreation.autoRenewPeriod != null
                        ? Duration._fromProtobuf(
                              body.tokenCreation.autoRenewPeriod
                          )
                        : undefined,
                tokenMemo:
                    body.tokenCreation.memo != null
                        ? body.tokenCreation.memo
                        : undefined,
            });
        } else if (body.tokenDeletion != null) {
            return new TokenDeleteTransaction({
                tokenId:
                    body.tokenDeletion.token != null
                        ? TokenId._fromProtobuf(body.tokenDeletion.token)
                        : undefined,
            });
        } else if (body.tokenDissociate != null) {
            return new TokenDissociateTransaction({
                tokenIds:
                    body.tokenDissociate.tokens != null
                        ? body.tokenDissociate.tokens.map((token) =>
                              TokenId._fromProtobuf(token)
                          )
                        : undefined,
                accountId:
                    body.tokenDissociate.account != null
                        ? AccountId._fromProtobuf(body.tokenDissociate.account)
                        : undefined,
            });
        } else if (body.tokenFreeze != null) {
            return new TokenFreezeTransaction({
                tokenId:
                    body.tokenFreeze.token != null
                        ? TokenId._fromProtobuf(body.tokenFreeze.token)
                        : undefined,
                accountId:
                    body.tokenFreeze.account != null
                        ? AccountId._fromProtobuf(body.tokenFreeze.account)
                        : undefined,
            });
        } else if (body.tokenGrantKyc != null) {
            return new TokenGrantKycTransaction({
                tokenId:
                    body.tokenGrantKyc.token != null
                        ? TokenId._fromProtobuf(body.tokenGrantKyc.token)
                        : undefined,
                accountId:
                    body.tokenGrantKyc.account != null
                        ? AccountId._fromProtobuf(body.tokenGrantKyc.account)
                        : undefined,
            });
        } else if (body.tokenMint != null) {
            return new TokenMintTransaction({
                tokenId:
                    body.tokenMint.token != null
                        ? TokenId._fromProtobuf(body.tokenMint.token)
                        : undefined,
                amount:
                    body.tokenMint.amount != null
                        ? body.tokenMint.amount
                        : undefined,
            });
        } else if (body.tokenRevokeKyc != null) {
            return new TokenRevokeKycTransaction({
                tokenId:
                    body.tokenRevokeKyc.token != null
                        ? TokenId._fromProtobuf(body.tokenRevokeKyc.token)
                        : undefined,
                accountId:
                    body.tokenRevokeKyc.account != null
                        ? AccountId._fromProtobuf(body.tokenRevokeKyc.account)
                        : undefined,
            });
        } else if (body.tokenUnfreeze != null) {
            return new TokenUnfreezeTransaction({
                tokenId:
                    body.tokenUnfreeze.token != null
                        ? TokenId._fromProtobuf(body.tokenUnfreeze.token)
                        : undefined,
                accountId:
                    body.tokenUnfreeze.account != null
                        ? AccountId._fromProtobuf(body.tokenUnfreeze.account)
                        : undefined,
            });
        } else if (body.tokenUpdate != null) {
            return new TokenUpdateTransaction({
                tokenId:
                    body.tokenUpdate.token != null
                        ? TokenId._fromProtobuf(body.tokenUpdate.token)
                        : undefined,
                tokenName:
                    body.tokenUpdate.name != null
                        ? body.tokenUpdate.name
                        : undefined,
                tokenSymbol:
                    body.tokenUpdate.symbol != null
                        ? body.tokenUpdate.symbol
                        : undefined,
                treasuryAccountId:
                    body.tokenUpdate.treasury != null
                        ? AccountId._fromProtobuf(body.tokenUpdate.treasury)
                        : undefined,
                adminKey:
                    body.tokenUpdate.adminKey != null
                        ? keyFromProtobuf(body.tokenUpdate.adminKey)
                        : undefined,
                kycKey:
                    body.tokenUpdate.kycKey != null
                        ? keyFromProtobuf(body.tokenUpdate.kycKey)
                        : undefined,
                freezeKey:
                    body.tokenUpdate.freezeKey != null
                        ? keyFromProtobuf(body.tokenUpdate.freezeKey)
                        : undefined,
                wipeKey:
                    body.tokenUpdate.wipeKey != null
                        ? keyFromProtobuf(body.tokenUpdate.wipeKey)
                        : undefined,
                supplyKey:
                    body.tokenUpdate.supplyKey != null
                        ? keyFromProtobuf(body.tokenUpdate.supplyKey)
                        : undefined,
                autoRenewAccountId:
                    body.tokenUpdate.autoRenewAccount != null
                        ? AccountId._fromProtobuf(
                              body.tokenUpdate.autoRenewAccount
                          )
                        : undefined,
                expirationTime:
                    body.tokenUpdate.expiry != null
                        ? Timestamp._fromProtobuf(body.tokenUpdate.expiry)
                        : undefined,
                autoRenewPeriod:
                    body.tokenUpdate.autoRenewPeriod != null
                        ? Duration._fromProtobuf(
                              body.tokenUpdate.autoRenewPeriod
                          )
                        : undefined,
                tokenMemo:
                    body.tokenUpdate.memo != null
                        ? body.tokenUpdate.memo.value != null
                            ? body.tokenUpdate.memo.value
                            : undefined
                        : undefined,
            });
        } else if (body.tokenWipe != null) {
            return new TokenWipeTransaction({
                tokenId:
                    body.tokenWipe.token != null
                        ? TokenId._fromProtobuf(body.tokenWipe.token)
                        : undefined,
                accountId:
                    body.tokenWipe.account != null
                        ? AccountId._fromProtobuf(body.tokenWipe.account)
                        : undefined,
                amount:
                    body.tokenWipe.amount != null
                        ? body.tokenWipe.amount
                        : undefined,
            });
        }

        throw "Unsupported scheduled transaction body";
    }
}
