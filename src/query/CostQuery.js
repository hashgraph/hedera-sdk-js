import TransactionId from "../transaction/TransactionId";
import Hbar from "../Hbar";
import Executable from "../Executable";
import AccountId from "../account/AccountId";
import { _makePaymentTransaction, COST_QUERY } from "./Query";
import {
    ResponseType as ProtoResponseType
} from "@hashgraph/proto";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 * @typedef {import("../Status").default} Status
 */

/**
 * @template OutputT
 * @augments {Executable<proto.IQuery, proto.IResponse, Hbar>}
 */
export default class CostQuery extends Executable {
    /**
     * @param {import("./Query").default<OutputT>} query
     */
    constructor(query) {
        super();

        this._query = query;

        /**
         * @type {proto.IQueryHeader | null}
         */
        this._header = null;

        this._nextIndex = 0;
    }

    /**
     * @abstract
     * @protected
     * @param {import("../client/Client").default<*, *>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (client == null) {
            throw new Error("Cannot do CostQuery without Client");
        }

        const operator = client._operator;

        if (operator == null) {
            throw new Error(
                "`client` must have an `operator` or an explicit payment transaction must be provided"
            );
        }

        this._header = {
            payment: await _makePaymentTransaction(
                /** @type {import("../transaction/TransactionId").default} */
                (TransactionId.generate(new AccountId(0))),
                new AccountId(0),
                operator,
                new Hbar(0)
            ),
            responseType: ProtoResponseType.COST_ANSWER,
        };
    }

    /**
     * @abstract
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return this._query._onMakeRequest(
            /** @type {proto.IQueryHeader} */ (this._header)
        );
    }

    /**
     * @abstract
     * @internal
     * @param {proto.IResponse} status
     * @returns {Status}
     */
    _mapResponseStatus(status) {
        return this._query._mapResponseStatus(status);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @param {AccountId} nodeAccountId
     * @param {proto.IQuery} request
     * @returns {Promise<Hbar>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async _mapResponse(response, nodeAccountId, request) {
        const cost = this._query._mapResponseHeader(response).cost;
        return Hbar.fromTinybars(/** @type {Long | number} */ (cost));
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return this._query._execute(channel, request);
    }

    /**
     * @override
     * @param {import("../client/Client").default<*, *>} client
     * @returns {AccountId}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getNodeAccountId(client) {
        return this._query._paymentTransactionNodeIds[this._nextIndex];
    }

    /**
     * @abstract
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        this._nextIndex =
            (this._nextIndex + 1) %
            this._query._paymentTransactionNodeIds.length;
    }
}

COST_QUERY.push((query) => new CostQuery(query));
