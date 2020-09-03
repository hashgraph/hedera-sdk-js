import proto from "@hashgraph/proto";
import Client from "./Client.js";
import Hbar from "./Hbar";
import AccountId from "./account/AccountId";
import Channel from "./Channel.js";

/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template O
 */
export default class Query {
    constructor() {
        /** @type {?Object} */
        this._paymentTransactionId = null;

        /** @type {Object[]} */
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
     * @param {Client} client
     * @returns {Promise<O>}
     */
    async execute(client) {
        const request = this._makeRequest({
            responseType: proto.ResponseType.ANSWER_ONLY,
        });

        const nodeId = this._nodeId ?? client._getNextNodeId();

        const channel = client._getNetworkChannel(nodeId);

        const method = this._getQueryMethod(channel);

        const response = await method(request);

        const output = this._mapResponse(response);

        return output;
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return true;
    }

    /**
     * @abstract
     * @protected
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    // @ts-ignore
    _getQueryMethod(channel) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    // @ts-ignore
    _makeRequest(queryHeader) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {proto.IResponse} response
     * @returns {O}
     */
    // @ts-ignore
    _mapResponse(response) {
        throw new Error("not implemented");
    }
}
