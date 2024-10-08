/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2024 Hedera Hashgraph, LLC
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

import PendingAirdropId from "../token/PendingAirdropId.js";
import AirdropPendingTransaction from "./AirdropPendingTransaction.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";

/**
 * @typedef {import("@hashgraph/proto").proto.ITransaction} HashgraphProto.proto.ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} HashgraphProto.proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} HashgraphProto.proto.TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ISignedTransaction} HashgraphProto.proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} HashgraphProto.proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITokenClaimAirdropTransactionBody} HashgraphProto.proto.ITokenClaimAirdropTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../account/AccountId.js").default} AccountId
 */

export default class TokenClaimAirdropTransaction extends AirdropPendingTransaction {
    /**
     * @param {object} props
     * @param {PendingAirdropId[]} [props.pendingAirdropIds]
     */
    constructor(props = {}) {
        super(props);
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.ITransaction} request
     * @returns {Promise<HashgraphProto.proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.token.claimAirdrop(request);
    }

    /**
     * @override
     * @internal
     * @returns {HashgraphProto.proto.ITokenClaimAirdropTransactionBody}
     */
    _makeTransactionData() {
        return {
            pendingAirdrops: this.pendingAirdropIds.map((pendingAirdropId) =>
                pendingAirdropId.toBytes(),
            ),
        };
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.ITransaction[]} transactions
     * @param {HashgraphProto.proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {HashgraphProto.proto.ITransactionBody[]} bodies
     * @returns {TokenClaimAirdropTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const { pendingAirdrops } =
            /** @type {HashgraphProto.proto.ITokenClaimAirdropTransactionBody} */ (
                body.tokenClaimAirdrop
            );

        return Transaction._fromProtobufTransactions(
            new TokenClaimAirdropTransaction({
                pendingAirdropIds: pendingAirdrops?.map((pendingAirdrop) => {
                    return PendingAirdropId.fromBytes(pendingAirdrop);
                }),
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies,
        );
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<HashgraphProto.proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "tokenClaimAirdrop";
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `TokenClaimAirdropTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "tokenClaimAirdrop",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    TokenClaimAirdropTransaction._fromProtobuf,
);
