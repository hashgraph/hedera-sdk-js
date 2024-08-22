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

import AccountId from "../account/AccountId.js";
import Key from "../Key.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import ServiceEndpoint from "./ServiceEndpoint.js";

const DESCRIPTION_MAX_LENGTH = 100;
const GOSSIP_ENDPOINTS_MAX_LENGTH = 10;
const SERVICE_ENDPOINTS_MAX_LENGTH = 8;

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITransaction} ITransaction
 * @typedef {import("@hashgraph/proto").proto.ITransaction} ISignedTransaction
 * @typedef {import("@hashgraph/proto").proto.TransactionBody} TransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionBody} ITransactionBody
 * @typedef {import("@hashgraph/proto").proto.ITransactionResponse} ITransactionResponse
 */

/**
 * @namespace com.hedera.hapi.node.addressbook
 * @typedef {import("@hashgraph/proto").com.hedera.hapi.node.addressbook.INodeCreateTransactionBody} INodeCreateTransactionBody
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * A transaction to create a new consensus node in the network.
 */
export default class NodeCreateTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {AccountId} [props.accountId]
     * @param {?string} [props.description]
     * @param {Array<ServiceEndpoint>} [props.gossipEndpoints]
     * @param {?Array<ServiceEndpoint>} [props.serviceEndpoints]
     * @param {Uint8Array} [props.gossipCaCertificate]
     * @param {Uint8Array} [props.grpcCertificateHash]
     * @param {Key} [props.adminKey]
     */
    constructor(props) {
        super();

        /**
         * @private
         * @type {?AccountId}
         * @description Node account identifier. It's required.
         */
        this._accountId = props?.accountId != null ? props.accountId : null;

        /**
         * @private
         * @type {?string}
         * @description Short description of the node.
         */
        this._description =
            props?.description != null ? props.description : null;

        /**
         * @private
         * @type {?Array<ServiceEndpoint>}
         * @description List of service endpoints for gossip. It's required.
         */
        this._gossipEndpoints =
            props?.gossipEndpoints != null ? props.gossipEndpoints : null;

        /**
         * @private
         * @type {?Array<ServiceEndpoint>}
         * @description List of service endpoints for gRPC calls.
         */
        this._serviceEndpoints =
            props?.serviceEndpoints != null ? props.serviceEndpoints : null;

        /**
         * @private
         * @type {?Uint8Array}
         * @description Certificate used to sign gossip events. It's required.
         */
        this._gossipCaCertificate =
            props?.gossipCaCertificate != null
                ? props.gossipCaCertificate
                : null;

        /**
         * @private
         * @type {?Uint8Array}
         * @description Hash of the node gRPC TLS certificate.
         */
        this._grpcCertificateHash =
            props?.grpcCertificateHash != null
                ? props.grpcCertificateHash
                : null;

        /**
         * @private
         * @type {?Key}
         * @description Administrative key controlled by the node operator. It's required.
         */
        this._adminKey = props?.adminKey != null ? props.adminKey : null;
    }

    /**
     * @internal
     * @param {ITransaction[]} transactions
     * @param {ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {ITransactionBody[]} bodies
     * @returns {NodeCreateTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies,
    ) {
        const body = bodies[0];
        const nodeCreate = /** @type {INodeCreateTransactionBody} */ (
            body.nodeCreate
        );

        return Transaction._fromProtobufTransactions(
            new NodeCreateTransaction({
                accountId:
                    nodeCreate.accountId != null
                        ? AccountId._fromProtobuf(nodeCreate.accountId)
                        : undefined,
                description:
                    nodeCreate.description != null
                        ? nodeCreate.description
                        : undefined,
                gossipEndpoints:
                    nodeCreate.gossipEndpoint != null
                        ? nodeCreate.gossipEndpoint.map((endpoint) =>
                              ServiceEndpoint._fromProtobuf(endpoint),
                          )
                        : undefined,
                serviceEndpoints:
                    nodeCreate.serviceEndpoint != null
                        ? nodeCreate.serviceEndpoint.map((endpoint) =>
                              ServiceEndpoint._fromProtobuf(endpoint),
                          )
                        : undefined,
                gossipCaCertificate:
                    nodeCreate.gossipCaCertificate != null
                        ? nodeCreate.gossipCaCertificate
                        : undefined,
                grpcCertificateHash:
                    nodeCreate.grpcCertificateHash != null
                        ? nodeCreate.grpcCertificateHash
                        : undefined,
                adminKey:
                    nodeCreate.adminKey != null
                        ? Key._fromProtobufKey(nodeCreate.adminKey)
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
     * @param {AccountId | string} accountId
     * @description Set node account identifier.
     * @returns {NodeCreateTransaction}
     */
    setAccountId(accountId) {
        this._requireNotFrozen();
        this._accountId =
            accountId instanceof AccountId
                ? accountId
                : AccountId.fromString(accountId);

        return this;
    }

    /**
     * @description Get node account identifier.
     * @returns {?AccountId}
     */
    get accountId() {
        return this._accountId;
    }

    /**
     * @param {string} description
     * @description Set description of the node.
     * @returns {NodeCreateTransaction}
     */
    setDescription(description) {
        this._requireNotFrozen();
        if (description.length > DESCRIPTION_MAX_LENGTH) {
            throw new Error(
                `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`,
            );
        }
        this._description = description;

        return this;
    }

    /**
     * @description Get description of the node.
     * @returns {?string}
     */
    get description() {
        return this._description;
    }

    /**
     * @param {ServiceEndpoint[]} gossipEndpoints
     * @description Set list of service endpoints for gossip.
     * @returns {NodeCreateTransaction}
     */
    setGossipEndpoints(gossipEndpoints) {
        this._requireNotFrozen();
        if (gossipEndpoints.length == 0) {
            throw new Error("GossipEndpoints list must not be empty.");
        }

        if (gossipEndpoints.length > GOSSIP_ENDPOINTS_MAX_LENGTH) {
            throw new Error(
                `GossipEndpoints list must not contain more than ${GOSSIP_ENDPOINTS_MAX_LENGTH} entries.`,
            );
        }

        this._gossipEndpoints = [...gossipEndpoints];

        return this;
    }

    /**
     * @description Get list of service endpoints for gossip.
     * @returns {?Array<ServiceEndpoint>}
     */
    get gossipEndpoints() {
        return this._gossipEndpoints;
    }

    /**
     * @param {ServiceEndpoint} endpoint
     * @description Add an endpoint to the list of service endpoints for gossip.
     * @returns {NodeCreateTransaction}
     */
    addGossipEndpoint(endpoint) {
        if (this._gossipEndpoints != null) {
            this._gossipEndpoints.push(endpoint);
        }
        return this;
    }

    /**
     * @param {ServiceEndpoint[]} serviceEndpoints
     * @description Set list of service endpoints for gRPC calls.
     * @returns {NodeCreateTransaction}
     */
    setServiceEndpoints(serviceEndpoints) {
        this._requireNotFrozen();
        if (serviceEndpoints.length == 0) {
            throw new Error("ServiceEndpoints list must not be empty.");
        }

        if (serviceEndpoints.length > SERVICE_ENDPOINTS_MAX_LENGTH) {
            throw new Error(
                `ServiceEndpoints list must not contain more than ${SERVICE_ENDPOINTS_MAX_LENGTH} entries.`,
            );
        }

        this._serviceEndpoints = [...serviceEndpoints];

        return this;
    }

    /**
     * @description Get list of service endpoints for gRPC calls.
     * @returns {?Array<ServiceEndpoint>}
     */
    get serviceEndpoints() {
        return this._serviceEndpoints;
    }

    /**
     * @param {ServiceEndpoint} endpoint
     * @description Add an endpoint to the list of service endpoints for gRPC calls.
     * @returns {NodeCreateTransaction}
     */
    addServiceEndpoint(endpoint) {
        if (this._serviceEndpoints != null) {
            this._serviceEndpoints.push(endpoint);
        }
        return this;
    }

    /**
     * @param {Uint8Array} bytes
     * @description Set certificate used to sign gossip events.
     * @returns {NodeCreateTransaction}
     */
    setGossipCaCertificate(bytes) {
        this._requireNotFrozen();
        if (bytes.length == 0) {
            throw new Error("GossipCaCertificate must not be empty.");
        }

        this._gossipCaCertificate = bytes;

        return this;
    }

    /**
     * @description Get certificate used to sign gossip events.
     * @returns {?Uint8Array}
     */
    get gossipCaCertificate() {
        return this._gossipCaCertificate;
    }

    /**
     * @param {Uint8Array} bytes
     * @description Set hash of the node gRPC TLS certificate.
     * @returns {NodeCreateTransaction}
     */
    setCertificateHash(bytes) {
        this._requireNotFrozen();
        this._grpcCertificateHash = bytes;

        return this;
    }

    /**
     * @description Get hash of the node gRPC TLS certificate.
     * @returns {?Uint8Array}
     */
    get certificateHash() {
        return this._grpcCertificateHash;
    }

    /**
     * @param {Key} adminKey
     * @description Set administrative key controlled by the node operator.
     * @returns {NodeCreateTransaction}
     */
    setAdminKey(adminKey) {
        this._requireNotFrozen();
        this._adminKey = adminKey;

        return this;
    }

    /**
     * @description Get administrative key controlled by the node operator.
     * @returns {?Key}
     */
    get adminKey() {
        return this._adminKey;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {ITransaction} request
     * @returns {Promise<ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.addressBook.createNode(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "nodeCreate";
    }

    /**
     * @override
     * @protected
     * @returns {INodeCreateTransactionBody}
     */
    _makeTransactionData() {
        return {
            accountId:
                this._accountId != null ? this._accountId._toProtobuf() : null,
            description: this._description != null ? this._description : null,
            gossipEndpoint:
                this._gossipEndpoints != null
                    ? this._gossipEndpoints.map(
                          (/** @type {ServiceEndpoint} */ endpoint) =>
                              endpoint._toProtobuf(),
                      )
                    : null,
            serviceEndpoint:
                this._serviceEndpoints != null
                    ? this._serviceEndpoints.map(
                          (/** @type {ServiceEndpoint} */ endpoint) =>
                              endpoint._toProtobuf(),
                      )
                    : null,
            gossipCaCertificate:
                this._gossipCaCertificate != null
                    ? this._gossipCaCertificate
                    : null,
            grpcCertificateHash:
                this._grpcCertificateHash != null
                    ? this._grpcCertificateHash
                    : null,
            adminKey:
                this._adminKey != null ? this._adminKey._toProtobufKey() : null,
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp = /** @type {import("../Timestamp.js").default} */ (
            this._transactionIds.current.validStart
        );
        return `NodeCreateTransaction:${timestamp.toString()}`;
    }
}

TRANSACTION_REGISTRY.set(
    "nodeCreate",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    NodeCreateTransaction._fromProtobuf,
);
