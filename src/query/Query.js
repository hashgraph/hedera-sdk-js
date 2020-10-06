import Status from "../Status";
import Hbar from "../Hbar";
import Executable from "../Executable";
import TransactionId from "../transaction/TransactionId";
import {
    Query as ProtoQuery,
    TransactionBody as ProtoTransactionBody,
    ResponseType as ProtoResponseType,
    ResponseCodeEnum,
} from "@hashgraph/proto";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ResponseCodeEnum} proto.ResponseCodeEnum
 */

/**
 * @typedef {import("../account/AccountId").default} AccountId
 * @typedef {import("../client/Client").ClientOperator} ClientOperator
 */

/**
 * @type {Map<ProtoQuery["query"], (query: proto.IQuery) => Query<*>>}
 */
export const QUERY_REGISTRY = new Map();

/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template OutputT
 * @augments {Executable<proto.IQuery, proto.IResponse, OutputT>}
 */
export default class Query extends Executable {
    constructor() {
        super();

        /** @type {?TransactionId} */
        this._paymentTransactionId = null;

        /** @type {proto.ITransaction[]} */
        this._paymentTransactions = [];

        /** @type {AccountId[]} */
        this._paymentTransactionNodeIds = [];

        /** @type {number} */
        this._nextPaymentTransactionIndex = 0;

        /** @type {?Hbar} */
        this._queryPayment = null;

        /** @type {?Hbar} */
        this._maxQueryPayment = null;

        /**
         * Explicit node account ID. If set, this query will be executed on this node and not chose a node
         * from the client's network.
         *
         * @type {?AccountId}
         */
        this._nodeId = null;
    }

    /**
     * @template T
     * @param {Uint8Array} bytes
     * @returns {Query<T>}
     */
    static fromBytes(bytes) {
        const query = ProtoQuery.decode(bytes);

        if (query.query == null) {
            throw new Error("(BUG) query.query was not set in the protobuf");
        }

        const fromProtobuf = /** @type {(query: proto.IQuery) => Query<T>} */ (QUERY_REGISTRY.get(
            query.query
        ));

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Query.fromBytes() not implemented for type ${query.query}`
            );
        }

        return fromProtobuf(query);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return ProtoQuery.encode(this._makeRequest()).finish();
    }

    /**
     * Set the account ID of the node that will be used to submit this
     * query to the network.
     *
     * This node must exist in the network on the client that is used to later
     * execute this query.
     *
     * @param {AccountId} nodeId
     * @returns {this}
     */
    setNodeAccountId(nodeId) {
        this._nodeId = nodeId;

        return this;
    }

    /**
     * Set an explicit payment amount for this query.
     *
     * The client will submit exactly this amount for the payment of this query. Hedera
     * will not return any remainder.
     *
     * @param {Hbar} queryPayment
     * @returns {this}
     */
    setQueryPayment(queryPayment) {
        this._queryPayment = queryPayment;

        return this;
    }

    /**
     * Set the maximum payment allowable for this query.
     *
     * @param {Hbar} maxQueryPayment
     * @returns {this}
     */
    setMaxQueryPayment(maxQueryPayment) {
        this._maxQueryPayment = maxQueryPayment;

        return this;
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return true;
    }

    /**
     * @override
     * @template ChannelT
     * @template MirrorChannelT
     * @param {import("../client/Client").default<ChannelT, MirrorChannelT>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (
            this._paymentTransactions.length !== 0 ||
            !this._isPaymentRequired()
        ) {
            return;
        }

        // generate payment transactions if one was
        // not set and payment is required

        const operator = client._operator;

        if (operator == null) {
            throw new Error(
                "`client` must have an `operator` or an explicit payment transaction must be provided"
            );
        }

        const paymentAmount = this._queryPayment;

        if (paymentAmount == null) {
            throw new Error(
                "query cost estimator not implemented, use setQueryPayment"
            );
        }

        this._paymentTransactionId = TransactionId.generate(operator.accountId);

        if (this._nodeId == null) {
            // like how TransactionBuilder has to build (N / 3) native transactions
            // to handle multi - node retry, so too does the QueryBuilder for payment transactions

            const size = client._getNumberOfNodesForTransaction();
            this._paymentTransactions = [];
            this._paymentTransactionNodeIds = [];

            for (let i = 0; i < size; i += 1) {
                const nodeId = client._getNextNodeId();

                this._paymentTransactionNodeIds.push(nodeId);
                this._paymentTransactions.push(
                    await _makePaymentTransaction(
                        this._paymentTransactionId,
                        nodeId,
                        operator,
                        paymentAmount
                    )
                );
            }
        } else {
            // explicit node account ID being set means that we only
            // need to generate one payment transaction

            this._paymentTransactionNodeIds = [this._nodeId];
            this._paymentTransactions = [
                await _makePaymentTransaction(
                    this._paymentTransactionId,
                    this._nodeId,
                    operator,
                    paymentAmount
                ),
            ];
        }
    }

    /**
     * @abstract
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponseHeader(response) {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @returns {proto.IQueryHeader}
     */
    _makeRequestHeader() {
        /** @type {proto.IQueryHeader} */
        let header = {};

        if (this._isPaymentRequired() && this._paymentTransactions.length > 0) {
            header = {
                responseType: ProtoResponseType.ANSWER_ONLY,
                payment: this._paymentTransactions[
                    this._nextPaymentTransactionIndex
                ],
            };
        }

        return header;
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {Status}
     */
    _mapResponseStatus(response) {
        const { nodeTransactionPrecheckCode } = this._mapResponseHeader(
            response
        );

        return Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : ResponseCodeEnum.OK
        );
    }

    /**
     * @template ChannelT
     * @template MirrorChannelT
     * @param {import("../client/Client").default<ChannelT, MirrorChannelT>} client
     * @returns {AccountId}
     */
    _getNodeAccountId(client) {
        if (this._paymentTransactionNodeIds.length > 0) {
            // if there are payment transactions,
            // we need to use the node of the current payment transaction
            return this._paymentTransactionNodeIds[
                this._nextPaymentTransactionIndex
            ];
        }

        if (this._nodeId != null) {
            // free queries with an explicit node
            return this._nodeId;
        }

        if (client == null) {
            throw new Error(
                "requires a client to pick the next node ID for a query"
            );
        }

        // otherwise just pick the next node in the round robin
        // this is hit for free queries without an explicit node
        return client._getNextNodeId();
    }

    /**
     * @override
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        if (this._isPaymentRequired() && this._paymentTransactions.length > 0) {
            // each time we move our cursor to the next transaction
            // wrapping around to ensure we are cycling
            this._nextPaymentTransactionIndex =
                (this._nextPaymentTransactionIndex + 1) %
                this._paymentTransactions.length;
        }
    }
}

/**
 * @param {TransactionId} paymentTransactionId
 * @param {AccountId} nodeId
 * @param {ClientOperator} operator
 * @param {Hbar} paymentAmount
 * @returns {Promise<proto.ITransaction>}
 */
async function _makePaymentTransaction(
    paymentTransactionId,
    nodeId,
    operator,
    paymentAmount
) {
    /**
     * @type {proto.ITransactionBody}
     */
    const body = {
        transactionID: paymentTransactionId._toProtobuf(),
        nodeAccountID: nodeId._toProtobuf(),
        transactionFee: new Hbar(1).toTinybars(),
        transactionValidDuration: {
            seconds: 120,
        },
        cryptoTransfer: {
            transfers: {
                accountAmounts: [
                    {
                        accountID: operator.accountId._toProtobuf(),
                        amount: paymentAmount.negated().toTinybars(),
                    },
                    {
                        accountID: nodeId._toProtobuf(),
                        amount: paymentAmount.toTinybars(),
                    },
                ],
            },
        },
    };

    const bodyBytes = ProtoTransactionBody.encode(body).finish();
    const signature = await operator.transactionSigner(bodyBytes);

    return {
        bodyBytes,
        sigMap: {
            sigPair: [
                {
                    pubKeyPrefix: operator.publicKey.toBytes(),
                    ed25519: signature,
                },
            ],
        },
    };
}
