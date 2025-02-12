/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import ContractId from "./ContractId.js";
import AccountId from "../account/AccountId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.IContractDeleteTransactionBody} HashgraphProto.proto.IContractDeleteTransactionBody
 * @typedef {import("@hashgraph/proto").proto.IContractID} HashgraphProto.proto.IContractID
 * @typedef {import("@hashgraph/proto").proto.IAccountID} HashgraphProto.proto.IAccountID
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * Delete a smart contract, and transfer any remaining HBAR balance to a
 * designated account.
 *
 * If this call succeeds then all subsequent calls to that smart contract
 * SHALL execute the `0x0` opcode, as required for EVM equivalence.
 *
 * ### Requirements
 *  - An account or smart contract MUST be designated to receive all remaining
 *    account balances.
 *  - The smart contract MUST have an admin key set. If the contract does not
 *    have `admin_key` set, then this transaction SHALL fail and response code
 *    `MODIFYING_IMMUTABLE_CONTRACT` SHALL be set.
 *  - If `admin_key` is, or contains, an empty `KeyList` key, it SHALL be
 *    treated the same as an admin key that is not set.
 *  - The `Key` set for `admin_key` on the smart contract MUST have a valid
 *    signature set on this transaction.
 *  - The designated receiving account MAY have `receiver_sig_required` set. If
 *    that field is set, the receiver account MUST also sign this transaction.
 *  - The field `permanent_removal` MUST NOT be set. That field is reserved for
 *    internal system use when purging the smart contract from state. Any user
 *    transaction with that field set SHALL be rejected and a response code
 *    `PERMANENT_REMOVAL_REQUIRES_SYSTEM_INITIATION` SHALL be set.
 */
export default class ContractDeleteTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     * @param {ContractId | string} [props.transferContractId]
     * @param {AccountId | string} [props.transferAccountId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;

        /**
         * @private
         * @type {?AccountId}
         */
        this._transferAccountId = null;

        /**
         * @private
         * @type {?ContractId}
         */
        this._transferContractId = null;

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        if (props.transferAccountId != null) {
            this.setTransferAccountId(props.transferAccountId);
        }

        if (props.transferContractId != null) {
            this.setTransferContractId(props.transferContractId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {ContractDeleteTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const contractDelete =
            /** @type {HashgraphProto.proto.IContractDeleteTransactionBody} */ (
                body.contractDeleteInstance
            );

        return Transaction._fromProtobufTransactions(
            new ContractDeleteTransaction({
                contractId:
                    contractDelete.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IContractID} */ (
                                  contractDelete.contractID
                              ),
                          )
                        : undefined,
                transferAccountId:
                    contractDelete.transferAccountID != null
                        ? AccountId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IAccountID} */ (
                                  contractDelete.transferAccountID
                              ),
                          )
                        : undefined,
                transferContractId:
                    contractDelete.transferContractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {HashgraphProto.proto.IContractID} */ (
                                  contractDelete.transferContractID
                              ),
                          )
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractDeleteTransaction}
     */
    setContractId(contractId) {
        this._requireNotFrozen();
        this._contractId =
            typeof contractId === "string"
                ? ContractId.fromString(contractId)
                : contractId.clone();

        return this;
    }

    /**
     * @returns {?ContractId}
     */
    get transferContractId() {
        return this._transferContractId;
    }

    /**
     * Sets the contract ID which will receive all remaining hbars.
     *
     * @param {ContractId | string} transferContractId
     * @returns {ContractDeleteTransaction}
     */
    setTransferContractId(transferContractId) {
        this._requireNotFrozen();
        this._transferContractId =
            transferContractId instanceof ContractId
                ? transferContractId
                : ContractId.fromString(transferContractId);

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get transferAccountId() {
        return this._transferAccountId;
    }

    /**
     * Sets the account ID which will receive all remaining hbars.
     *
     * @param {AccountId | string} transferAccountId
     * @returns {ContractDeleteTransaction}
     */
    setTransferAccountId(transferAccountId) {
        this._requireNotFrozen();
        this._transferAccountId =
            transferAccountId instanceof AccountId
                ? transferAccountId
                : AccountId.fromString(transferAccountId);

        return this;
    }

    /**
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._contractId != null) {
            this._contractId.validateChecksum(client);
        }

        if (this._transferAccountId != null) {
            this._transferAccountId.validateChecksum(client);
        }

        if (this._transferContractId != null) {
            this._transferContractId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.deleteContract(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "contractDeleteInstance";
    }

    /**
     * @override
     * @protected
     * @returns {HashgraphProto.proto.IContractDeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            contractID:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
            transferAccountID: this._transferAccountId
                ? this._transferAccountId._toProtobuf()
                : null,
            transferContractID:
                this._transferContractId != null
                    ? this._transferContractId._toProtobuf()
                    : null,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `ContractDeleteTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "contractDeleteInstance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractDeleteTransaction._fromProtobuf,
);
