import Channel from "./channel/Channel";
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
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} _
     * @returns {Promise<void>}
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
     * @param {ResponseT} response
     * @param {AccountId} nodeId
     * @param {RequestT} request
     * @returns {Promise<OutputT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeId, request) {
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
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} _
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
     * @template ChannelT
     * @param {import("./client/Client").default<ChannelT>} client
     * @returns {Promise<OutputT>}
     */
    async execute(client) {
        await this._onExecute(client);

        for (let attempt = 0 /* loop forever */; ; attempt += 1) {
            const delay = Math.floor(250 * Math.pow(2, attempt));
            const request = this._makeRequest();
            const nodeId = /** @type {AccountId} */ (this._getNodeId(client));
            const channel = await client._getNetworkChannel(nodeId);
            const method = this._getMethod(channel);

            this._advanceRequest();

            const response = await method(request);
            const responseStatus = this._mapResponseStatus(response);

            if (this._shouldRetry(responseStatus, response)) {
                await sleep(delay);
                continue;
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
