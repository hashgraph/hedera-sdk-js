import GrpcServiceError from "./grpc/GrpcServiceError.js";
import GrpcStatus from "./grpc/GrpcStatus.js";
import List from "./transaction/List.js";
import Logger from "js-logger";

/**
 * @typedef {import("./account/AccountId.js").default} AccountId
 * @typedef {import("./channel/Channel.js").default} Channel
 * @typedef {import("./transaction/TransactionId.js").default} TransactionId
 * @typedef {import("./client/Client.js").ClientOperator} ClientOperator
 * @typedef {import("./Signer.js").Signer} Signer
 * @typedef {import("./PublicKey.js").default} PublicKey
 */

/**
 * @enum {string}
 */
export const ExecutionState = {
    Finished: "Finished",
    Retry: "Retry",
    Error: "Error",
};

export const RST_STREAM = /\brst[^0-9a-zA-Z]stream\b/i;

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
        this._maxAttempts = 10;

        /**
         * List of node account IDs for each transaction that has been
         * built.
         *
         * @internal
         * @type {List<AccountId>}
         */
        this._nodeAccountIds = new List();

        this._signOnDemand = false;

        /** @type {number | null} */
        this._minBackoff = null;

        /** @type {number | null} */
        this._maxBackoff = null;

        /**
         * @type {ClientOperator | null}
         */
        this._operator = null;

        /** @type {number | null} */
        this._requestTimeout = null;

        this._grpcDeadline = null;
    }

    /**
     * @returns {?AccountId[]}
     */
    get nodeAccountIds() {
        this._nodeAccountIds.setLocked();
        return this._nodeAccountIds.isEmpty ? null : this._nodeAccountIds.list;
    }

    /**
     * @param {AccountId[]} nodeIds
     * @returns {this}
     */
    setNodeAccountIds(nodeIds) {
        this._nodeAccountIds.setList(nodeIds).setLocked();
        return this;
    }

    /**
     * @deprecated
     * @returns {number}
     */
    get maxRetries() {
        console.warn("Deprecated: use maxAttempts instead");
        return this.maxAttempts;
    }

    /**
     * @param {number} maxRetries
     * @returns {this}
     */
    setMaxRetries(maxRetries) {
        console.warn("Deprecated: use setMaxAttempts() instead");
        return this.setMaxAttempts(maxRetries);
    }

    /**
     * @returns {number}
     */
    get maxAttempts() {
        return this._maxAttempts;
    }

    /**
     * @param {number} maxAttempts
     * @returns {this}
     */
    setMaxAttempts(maxAttempts) {
        this._maxAttempts = maxAttempts;

        return this;
    }

    /**
     * @returns {?number}
     */
    get grpcDeadline() {
        return this._grpcDeadline;
    }

    /**
     * @param {number} grpcDeadline
     * @returns {this}
     */
    setGrpcDeadline(grpcDeadline) {
        this._grpcDeadline = grpcDeadline;

        return this;
    }

    /**
     * @param {number} minBackoff
     * @returns {this}
     */
    setMinBackoff(minBackoff) {
        if (minBackoff == null) {
            throw new Error("minBackoff cannot be null.");
        } else if (this._maxBackoff != null && minBackoff > this._maxBackoff) {
            throw new Error("minBackoff cannot be larger than maxBackoff.");
        }
        this._minBackoff = minBackoff;
        return this;
    }

    /**
     * @returns {number | null}
     */
    get minBackoff() {
        return this._minBackoff;
    }

    /**
     * @param {?number} maxBackoff
     * @returns {this}
     */
    setMaxBackoff(maxBackoff) {
        if (maxBackoff == null) {
            throw new Error("maxBackoff cannot be null.");
        } else if (this._minBackoff != null && maxBackoff < this._minBackoff) {
            throw new Error("maxBackoff cannot be smaller than minBackoff.");
        }
        this._maxBackoff = maxBackoff;
        return this;
    }

    /**
     * @returns {number | null}
     */
    get maxBackoff() {
        return this._maxBackoff;
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
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
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
     * @abstract
     * @returns {string}
     */
    _getLogId() {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @returns {void}
     */
    _advanceRequest() {
        this._nodeAccountIds.advance();
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
            error.status._code === GrpcStatus.Unavailable._code ||
            error.status._code === GrpcStatus.ResourceExhausted._code ||
            (error.status._code === GrpcStatus.Internal._code &&
                RST_STREAM.test(error.message))
        );
    }

    /**
     * @param {AccountId} accountId
     * @param {PublicKey} publicKey
     * @param {(message: Uint8Array) => Promise<Uint8Array>} transactionSigner
     * @returns {this}
     */
    _setOperatorWith(accountId, publicKey, transactionSigner) {
        this._operator = {
            transactionSigner,
            accountId,
            publicKey,
        };
        return this;
    }

    /**
     * @param {Signer} signer
     * @returns {Promise<OutputT>}
     */
    async executeWithSigner(signer) {
        return signer.sendRequest(this);
    }

    /**
     * @template {Channel} ChannelT
     * @template MirrorChannelT
     * @param {import("./client/Client.js").default<ChannelT, MirrorChannelT>} client
     * @param {number=} requestTimeout
     * @returns {Promise<OutputT>}
     */
    async execute(client, requestTimeout) {
        if (this._requestTimeout == null) {
            this._requestTimeout =
                requestTimeout != null ? requestTimeout : client.requestTimeout;
        }

        await this._beforeExecute(client);

        if (this._maxBackoff == null) {
            this._maxBackoff = client.maxBackoff;
        }

        if (this._minBackoff == null) {
            this._minBackoff = client.minBackoff;
        }

        const maxAttempts =
            client._maxAttempts != null
                ? client._maxAttempts
                : this._maxAttempts;

        const startTime = Date.now();

        for (let attempt = 1 /* loop forever */; ; attempt += 1) {
            if (
                this._requestTimeout != null &&
                startTime + this._requestTimeout <= Date.now()
            ) {
                throw new Error("timeout exceeded");
            }

            let nodeAccountId;
            let node;

            // If node account IDs is locked then use the node account IDs
            // from the list, otherwise build a new list of one node account ID
            // using the entire network
            if (this._nodeAccountIds.locked) {
                nodeAccountId = this._getNodeAccountId();
                node = client._network.getNode(nodeAccountId);
            } else {
                node = client._network.getNode();
                nodeAccountId = node.accountId;
                this._nodeAccountIds.setList([nodeAccountId]);
            }

            if (node == null) {
                throw new Error(
                    `NodeAccountId not recognized: ${nodeAccountId.toString()}`
                );
            }

            const logId = this._getLogId();
            Logger.debug(
                `[${logId}] Node AccountID: ${node.accountId.toString()}, IP: ${node.address.toString()}`
            );

            const channel = node.getChannel();
            const request = await this._makeRequestAsync();

            // advance the internal index
            // non-free queries and transactions map to more than 1 actual transaction and this will cause
            // the next invocation of makeRequest to return the _next_ transaction
            this._advanceRequest();

            let response;

            if (!node.isHealthy()) {
                Logger.debug(
                    `[${logId}] node is not healthy, waiting ${node.getRemainingTime()}`
                );
                await node.backoff();
            }

            try {
                const promises = [];
                if (this._grpcDeadline != null) {
                    promises.push(
                        // eslint-disable-next-line ie11/no-loop-func
                        new Promise((_, reject) =>
                            setTimeout(
                                // eslint-disable-next-line ie11/no-loop-func
                                () =>
                                    reject(new Error("grpc deadline exceeded")),
                                /** @type {number=} */ (this._grpcDeadline)
                            )
                        )
                    );
                }
                promises.push(this._execute(channel, request));
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                response = /** @type {ResponseT} */ (
                    await Promise.race(promises)
                );
            } catch (err) {
                const error = GrpcServiceError._fromResponse(
                    /** @type {Error} */ (err)
                );
                Logger.debug(
                    `[${logId}] received gRPC error ${JSON.stringify(error)}`
                );

                if (
                    error instanceof GrpcServiceError &&
                    this._shouldRetryExceptionally(error) &&
                    attempt <= maxAttempts
                ) {
                    client._network.increaseBackoff(node);
                    continue;
                }

                throw err;
            }

            client._network.decreaseBackoff(node);

            switch (this._shouldRetry(request, response)) {
                case ExecutionState.Retry:
                    await delayForAttempt(
                        attempt,
                        this._minBackoff,
                        this._maxBackoff
                    );
                    continue;
                case ExecutionState.Finished:
                    return this._mapResponse(response, nodeAccountId, request);
                case ExecutionState.Error:
                    throw this._mapStatusError(request, response);
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
 * @param {number} minBackoff
 * @param {number} maxBackoff
 * @returns {Promise<void>}
 */
function delayForAttempt(attempt, minBackoff, maxBackoff) {
    // 0.1s, 0.2s, 0.4s, 0.8s, ...
    const ms = Math.min(
        Math.floor(minBackoff * Math.pow(2, attempt)),
        maxBackoff
    );
    return new Promise((resolve) => setTimeout(resolve, ms));
}
