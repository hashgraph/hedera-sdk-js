import proto from "@hashgraph/proto";
import Status from "./Status";
import Hbar from "./Hbar";
import AccountId from "./account/AccountId";
import Channel from "./channel/Channel";
import HederaExecutable from "./HederaExecutable";

/**
 * @template OutputT
 * @type {Map<proto.Query["query"], (query: proto.Query) => Query<OutputT>>}
 */
export const QUERY_REGISTRY = new Map();

/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template OutputT
 * @augments {HederaExecutable<proto.IQuery, proto.IResponse, OutputT>}
 */
export default class Query extends HederaExecutable {
    constructor() {
        super();

        /** @type {?import("./TransactionId").default} */
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
        const query = proto.Query.decode(bytes);

        if (query.query == null) {
            throw new Error("query.query was not set in the protobuf");
        }

        const fromProtobuf = QUERY_REGISTRY.get(query.query);

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Transaction.fromBytes() not implemented for type ${
                    query.query != null ? query.query : ""
                }`
            );
        }

        return /** @type {Query<T>} */ (
            /** @type {unknown} */ (fromProtobuf(query))
        );
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.Query.encode(this._makeRequest()).finish();
    }

    /**
     * Set an explicit node ID to use for this query.
     *
     * @param {AccountId} nodeId
     * @returns {this}
     */
    setNodeId(nodeId) {
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
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {Promise<void>}
     */
    async _onExecute(client) {
        if (this._paymentTransactions != null || !this._isPaymentRequired()) {
            return;
        }

        const operator = client.getOperator();

        if (operator == null) {
            throw new Error(
                "`client` must have an `operator` or an explicit payment transaction must be provided"
            );
        }

        const cost = this._queryPayment;

        // if (this._queryPayment == null) {
        //     const cost = this.getCost(client);
        //     const maxCost = this._maxQueryPayment != null ? this._maxQueryPayment : client._maxQueryPayment;

        //     if (cost.compareTo(maxCost) > 0) {
        //         return new MaxQueryPaymentExceeded(this, cost, maxCost);
        //     }
        // } else {
        // }

        if (this._nodeId == null) {
            const size = client._getNumberOfNodesForTransaction();
            this._paymentTransactions = [];
            this._paymentTransactionNodeIds = [];

            for (let i = 0; i < size; i += 1) {
                const nodeId = client._getNextNodeId();

                this._paymentTransactionNodeIds.push(nodeId);
                this._paymentTransactions.push(
                    await _makePaymentTransaction(
                        /** @type {import("./TransactionId").default} */ (this
                            ._paymentTransactionId),
                        nodeId,
                        operator,
                        /** @type {Hbar} */ (cost)
                    )
                );
            }
        } else {
            this._paymentTransactions = [
                await _makePaymentTransaction(
                    /** @type {import("./TransactionId").default} */ (this
                        ._paymentTransactionId),
                    this._nodeId,
                    operator,
                    /** @type {Hbar} */ (cost)
                ),
            ];
            this._paymentTransactionNodeIds = [this._nodeId];
        }
    }

    /**
     * @abstract
     * @protected
     * @param {proto.IResponse} _
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(_) {
        throw new Error("not implemented");
    }

    /**
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        /** @type {proto.IQueryHeader} */
        let header = {};

        if (this._isPaymentRequired() && this._paymentTransactions != null) {
            header = {
                payment: this._paymentTransactions[this._nextPaymentTransactionIndex],
                responseType: proto.ResponseType.ANSWER_ONLY,
            };
        }

        return this._onMakeRequest(header);
    }
    
    /**
     * @abstract
     * @internal
     * @param {proto.IQueryHeader} _
     * @returns {proto.IQuery}
     */
    _onMakeRequest(_) {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {Status}
     */
    _mapResponseStatus(response) {
        return Status._fromCode(
            /** @type {proto.ResponseCodeEnum} */ (this._mapResponseHeader(
                response
            ).nodeTransactionPrecheckCode)
        );
    }

    /**
     * @abstract
     * @protected
     * @param {proto.IResponse} _
     * @param {AccountId} __
     * @param {proto.IQuery} ___
     * @returns {OutputT}
     */
    _mapResponse(_, __, ___) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {Channel} _
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(_) {
        throw new Error("not implemented");
    }

    /**
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {AccountId}
     */
    _getNodeId(client) {
        return this._nodeId != null ? this._nodeId : client._getNextNodeId();
    }

    /**
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        if (this._isPaymentRequired() && this._paymentTransactions != null) {
            // each time we move our cursor to the next transaction
            // wrapping around to ensure we are cycling
            this._nextPaymentTransactionIndex =
                (this._nextPaymentTransactionIndex + 1) %
                this._paymentTransactions.length;
        }
    }
}

/**
 * @param {import("./TransactionId").default} paymentTransactionId
 * @param {AccountId} nodeId
 * @param {import("./client/Client").ClientOperator} operator
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

    const bodyBytes = proto.TransactionBody.encode(body).finish();
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
