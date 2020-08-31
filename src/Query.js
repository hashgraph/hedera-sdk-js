import proto from "@hashgraph/proto";
import Client from "./Client.js";

/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template O
 */
export default class Query {
    /**
     * @param {Client} client
     * @returns {Promise<O>}
     */
    async execute(client) {
        const request = this._makeRequest({
            responseType: proto.ResponseType.ANSWER_ONLY,
        });

        const channel = client.channel;

        const response = await channel.crypto.cryptoGetBalance(request);

        const output = this._mapResponse(response);

        return output;
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return false;
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
