import PrecheckStatusError from "./PrecheckStatusError.js";
import GrpcServiceError from "./grpc/GrpcServiceError.js";
import GrpcStatus from "./grpc/GrpcStatus.js";
import Status from "./Status.js";

/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 */

// maximum number of attempts for executing the transaction
// with the backoff, attempt #10 will wait nearly a minute
const maxAttempts = 10;

/**
 * @abstract
 * @internal
 * @template RequestT
 * @template ResponseT
 * @template OutputT
 */
export default class Executable {
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
     * @returns {RequestT}
     */
    _makeRequest() {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @internal
     * @param {ResponseT} response
     * @returns {Status}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponseStatus(response) {
        throw new Error("not implemented");
    }

    /**
     * @abstract
     * @protected
     * @param {ResponseT} response
     * @param {AccountId} nodeAccountId
     * @param {RequestT} request
     * @returns {Promise<OutputT>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponse(response, nodeAccountId, request) {
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
     * @template ChannelT
     * @template MirrorChannelT
     * @param {?import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @returns {AccountId}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _getNodeAccountId(client) {
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
     * @param {ResponseT} response
     * @returns {boolean}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(responseStatus, response) {
        return (
            responseStatus === Status.Busy ||
            responseStatus === Status.PlatformTransactionNotCreated
        );
    }

    /**
     * @abstract
     * @protected
     * @param {GrpcServiceError} error
     * @returns {boolean}
     */
    _shouldRetryExceptionally(error) {
        return (
            error.status === GrpcStatus.Unavailable ||
            error.status === GrpcStatus.ResourceExhausted
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
            const nodeAccountId = this._getNodeAccountId(client);
            const nodeId = client._getNodeId(nodeAccountId);

            if (nodeId == null) {
                throw new Error(
                    `NodeAccountId not recognized: ${nodeAccountId.toString()}`
                );
            }

<<<<<<< Updated upstream
            if (!nodeId.isHealthy()) {
                continue;
            }

=======
>>>>>>> Stashed changes
            const channel = client._getNetworkChannel(nodeAccountId);
            const request = this._makeRequest();

            // advance the internal index
            // non-free queries and transactions map to more than 1 actual transaction and this will cause
            // the next invocation of makeRequest to return the _next_ transaction
            this._advanceRequest();

            let response;

            if (!nodeId.isHealthy()) {
                await nodeId.wait();
            }

            try {
                response = await this._execute(channel, request);
            } catch (err) {
                if (
                    err instanceof GrpcServiceError &&
                    this._shouldRetryExceptionally(err) &&
                    attempt <= maxAttempts
                ) {
                    nodeId.increaseDelay();
                    continue;
                }

                throw err;
            }

            nodeId.decreaseDelay();

            const responseStatus = this._mapResponseStatus(response);

            if (
                this._shouldRetry(responseStatus, response) &&
                attempt <= maxAttempts
            ) {
                await delayForAttempt(attempt);
                continue;
            }

            if (responseStatus !== Status.Ok) {
                throw new PrecheckStatusError({
                    status: responseStatus,
                    transactionId: this._getTransactionId(),
                });
            }

            return this._mapResponse(response, nodeAccountId, request);
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
