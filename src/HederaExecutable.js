import Client from "./Client";
import Channel from "./Channel";
import HederaPreCheckStatusError from "./HederaPreCheckStatusError";
import AccountId from "./account/AccountId";
import Status from "./Status";
import { sleep } from "./util";

/**
 * @abstract
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 */
export default class HederaExecutable {
    /**
     * @abstract
     * @protected
     * @param {Client} _
     * @returns {void}
     */
    _onExecute(_) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @returns {RequestT}
     */
    _makeRequest() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {ResponseT} _
     * @returns {Status}
     */
    _mapResponseStatus(_) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {ResponseT} _
     * @param {AccountId} __
     * @param {RequestT} ___
     * @returns {OutputT}
     */
    _mapResponse(_, __, ___) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {Channel} _
     * @returns {(request: RequestT) => Promise<ResponseT>}
     */
    _getMethod(_) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @param {Client} _
     * @returns {AccountId}
     */
    _getNodeId(_) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {Status} responseStatus
     * @param {ResponseT} _
     * @returns {boolean}
     */
    _shouldRetry(responseStatus, _) {
        return responseStatus.code == Status.Busy.code;
    }

    /**
     * @param {Client} client
     * @returns {Promise<OutputT>}
     */
    async execute(client) {
        this._onExecute(client);

        for (let attempt = 0 /* loop forever */; ; attempt += 1) {
            const delay = Math.floor(250 * Math.pow(2, attempt));

            const request = this._makeRequest();
            const nodeId = /** @type {AccountId} */ (this._getNodeId(client));
            const channel = client._getNetworkChannel(nodeId);
            const method = this._getMethod(channel);

            this._advanceRequest();

            console.log("Node:", nodeId.toString());
            console.log("Request:", JSON.stringify(request));

            const response = await method(request);
            console.log("Response:", JSON.stringify(response));
            const responseStatus = this._mapResponseStatus(response);
            console.log("ResponseStatus:", responseStatus.toString());

            if (this._shouldRetry(responseStatus, response)) {
                await sleep(delay);
            }

            if (responseStatus.code != Status.Ok.code) {
                throw new HederaPreCheckStatusError({
                    status: responseStatus,
                });
            }

            return this._mapResponse(response, nodeId, request);
        }
    }
}
