import GrpcServiceError from "./grpc/GrpcServiceError.js";
import GrpcStatus from "./grpc/GrpcStatus.js";

/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

/**
 * @enum {string}
 */
export const ExecutionState = {
    Finished: "Finished",
    Retry: "Retry",
    Error: "Error",
};

export const RST_STREAM = /\brst[^0-9a-zA-Z]stream\b/gi;

/**
 * @abstract
 * @internal
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 */
export default class Executable {
    constructor() {
        /**
         * The number of times we can retry the grpc call
         *
         * @private
         * @type {number}
         */
        this._maxRetries = 10;

        /**
         * The index of the next transaction to be executed.
         *
         * @protected
         * @type {number}
         */
        this._nextNodeIndex = 0;

        /**
         * List of node account IDs for each transaction that has been
         * built.
         *
         * @internal
         * @type {AccountId[]}
         */
        this._nodeIds = [];
    }

    /**
     * @returns {?AccountId[]}
     */
    get nodeAccountIds() {
        return this._nodeIds.length != 0 ? this._nodeIds : null;
    }

    /**
     * @param {AccountId[]} nodeIds
     * @returns {this}
     */
    setNodeAccountIds(nodeIds) {
        this._nodeIds = nodeIds;

        return this;
    }

    /**
     * @returns {number}
     */
    get maxRetries() {
        return this._maxRetries;
    }

    /**
     * @param {number} maxRetries
     * @returns {this}
     */
    setMaxRetries(maxRetries) {
        this._maxRetries = maxRetries;

        return this;
    }

    /**
     * @abstract
     * @protected
     * @param {import("./client/Client.js").default<Channel, *>} client
     * @returns {Promise<void>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _beforeExecute(client) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {Promise<RequestT>}
     */
    _makeRequestAsync() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @param {RequestT} request
     * @param {ResponseT} response
     * @param {string | null} ledgerId
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response, ledgerId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {ResponseT} response
     * @param {AccountId} nodeAccountId
     * @param {RequestT} request
     * @param {string | null} ledgerId
     * @returns {Promise<OutputT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request, ledgerId) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @param {Channel} channel
     * @param {RequestT} request
     * @returns {Promise<ResponseT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _execute(channel, request) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {AccountId}
     */
    _getNodeAccountId() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @returns {TransactionId}
     */
    _getTransactionId() {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        // each time we move our cursor to the next transaction
        // wrapping around to ensure we are cycling
        this._nextNodeIndex = (this._nextNodeIndex + 1) % this._nodeIds.length;
    }

    /**
     * @abstract
     * @protected
     * @param {RequestT} request
     * @param {ResponseT} response
     * @returns {ExecutionState}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @param {GrpcServiceError} error
     * @returns {boolean}
     */
    _shouldRetryExceptionally(error) {
        return (
            error.status === GrpcStatus.Unavailable ||
            error.status === GrpcStatus.ResourceExhausted ||
            (error.status === GrpcStatus.Internal &&
                RST_STREAM.test(error.message))
        );
    }

    /**
     * @template {Channel} ChannelT
     * @template MirrorChannelT
     * @param {import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @returns {Promise<OutputT>}
     */
    async execute(client) {
        await this._beforeExecute(client);

        for (let attempt = 1 /* loop forever */; ; attempt += 1) {
            const nodeAccountId = this._getNodeAccountId();
            const node = client._network.networkNodes.get(
                nodeAccountId.toString()
            );

            if (node == null) {
                throw new Error(
                    `NodeAccountId not recognized: ${nodeAccountId.toString()}`
                );
            }

            node.inUse();

            const channel = node.channel;
            const request = await this._makeRequestAsync();

            // advance the internal index
            // non-free queries and transactions map to more than 1 actual transaction and this will cause
            // the next invocation of makeRequest to return the _next_ transaction
            this._advanceRequest();

            let response;

            if (!node.isHealthy()) {
                await node.wait();
            }

            try {
                response = await this._execute(channel, request);
            } catch (err) {
                const error = GrpcServiceError._fromResponse(err);

                if (
                    error instanceof GrpcServiceError &&
                    this._shouldRetryExceptionally(error) &&
                    attempt <= this._maxRetries
                ) {
                    node.increaseDelay();
                    continue;
                }

                throw err;
            }

            node.decreaseDelay();

            switch (this._shouldRetry(request, response)) {
                case ExecutionState.Retry:
                    await delayForAttempt(attempt);
                    continue;
                case ExecutionState.Finished:
                    return this._mapResponse(
                        response,
                        nodeAccountId,
                        request,
                        client._network._ledgerId
                    );
                case ExecutionState.Error:
                    throw this._mapStatusError(
                        request,
                        response,
                        client._network._ledgerId
                    );
                default:
                    throw new Error(
                        "(BUG) non-exhuastive switch statement for `ExecutionState`"
                    );
            }
        }
    }
}

/**
 * @param {number} attempt
 * @returns {Promise<void>}
 */
function delayForAttempt(attempt) {
    // 0.1s, 0.2s, 0.4s, 0.8s, ...
    const ms = Math.floor(50 * Math.pow(2, attempt));
    return new Promise((resolve) => setTimeout(resolve, ms));
}
