import TransactionId from "../transaction/TransactionId.js";
import Hbar from "../Hbar.js";
import Executable from "../Executable.js";
import AccountId from "../account/AccountId.js";
import { _makePaymentTransaction, COST_QUERY } from "./Query.js";
import * as HashgraphProto from "@hashgraph/proto";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../Status.js").default} Status
 * @typedef {import("../Executable.js").ExecutionState} ExecutionState
 */

/**
 * @template OutputT
 * @augments {Executable<HashgraphProto.proto.IQuery, HashgraphProto.proto.IResponse, Hbar>}
 */
export default class CostQuery extends Executable {
    /**
     * @param {import("./Query.js").default<OutputT>} query
     */
    constructor(query) {
        super();

        this._query = query;
        this._grpcDeadline = query._grpcDeadline;
        this._requestTimeout = query._requestTimeout;
        this._nodeAccountIds = query._nodeAccountIds.clone();
        this._operator = query._operator;

        /**
         * @type {HashgraphProto.proto.IQueryHeader | null}
         */
        this._header = null;
    }

    /**
     * @returns {TransactionId}
     */
    _getTransactionId() {
        return this._query._getTransactionId();
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        return `CostQuery:${this._query._getLogId()}`;
    }

    /**
     * @abstract
     * @protected
     * @param {import("../client/Client.js").default<*, *>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (client == null) {
            throw new Error("Cannot do CostQuery without Client");
        }

        const operator =
            this._operator != null ? this._operator : client._operator;

        if (operator == null) {
            throw new Error(
                "`client` must have an `operator` or an explicit payment transaction must be provided"
            );
        }

        if (this._query._nodeAccountIds.isEmpty) {
            this._query._nodeAccountIds.setList(
                client._network.getNodeAccountIdsForExecute()
            );
        }

        this._header = {
            payment: await _makePaymentTransaction(
                this._getLogId(),
                /** @type {import("../transaction/TransactionId.js").default} */
                (TransactionId.generate(new AccountId(0))),
                new AccountId(0),
                operator,
                new Hbar(0)
            ),
            responseType: HashgraphProto.proto.ResponseType.COST_ANSWER,
        };
    }

    /**
     * @abstract
     * @internal
     * @returns {Promise<HashgraphProto.proto.IQuery>}
     */
    _makeRequestAsync() {
        return Promise.resolve(
            this._query._onMakeRequest(
                /** @type {HashgraphProto.proto.IQueryHeader} */ (this._header)
            )
        );
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {ExecutionState}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        return this._query._shouldRetry(request, response);
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
        return this._query._mapStatusError(request, response);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<Hbar>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
        const cost = this._query._mapResponseHeader(response).cost;
        return Promise.resolve(
            Hbar.fromTinybars(/** @type {Long | number} */ (cost))
        );
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return this._query._execute(channel, request);
    }

    /**
     * @override
     * @returns {AccountId}
     */
    _getNodeAccountId() {
        if (!this._nodeAccountIds.isEmpty) {
            // if there are payment transactions,
            // we need to use the node of the current payment transaction
            return this._nodeAccountIds.current;
        } else {
            throw new Error(
                "(BUG) nodeAccountIds were not set for query before executing"
            );
        }
    }
}

COST_QUERY.push((query) => new CostQuery(query));
