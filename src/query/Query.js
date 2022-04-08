import Status from "../Status.js";
import AccountId from "../account/AccountId.js";
import Hbar from "../Hbar.js";
import Executable, { ExecutionState } from "../Executable.js";
import TransactionId from "../transaction/TransactionId.js";
import * as HashgraphProto from "@hashgraph/proto";
import PrecheckStatusError from "../PrecheckStatusError.js";
import MaxQueryPaymentExceeded from "../MaxQueryPaymentExceeded.js";
import Long from "long";
import Logger from "js-logger";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../PublicKey.js").default} PublicKey
 */

/**
 * @typedef {import("../client/Client.js").ClientOperator} ClientOperator
 * @typedef {import("../client/Client.js").default<*, *>} Client
 */

/**
 * @type {Map<HashgraphProto.proto.Query["query"], (query: HashgraphProto.proto.IQuery) => Query<*>>}
 */
export const QUERY_REGISTRY = new Map();

/**
 * Base class for all queries that can be submitted to Hedera.
 *
 * @abstract
 * @template OutputT
 * @augments {Executable<HashgraphProto.proto.IQuery, HashgraphProto.proto.IResponse, OutputT>}
 */
export default class Query extends Executable {
    constructor() {
        super();

        /** @type {?TransactionId} */
        this._paymentTransactionId = null;

        /** @type {HashgraphProto.proto.ITransaction[]} */
        this._paymentTransactions = [];

        /** @type {?Hbar} */
        this._queryPayment = null;

        /** @type {?Hbar} */
        this._maxQueryPayment = null;

        this._timestamp = Date.now();
    }

    /**
     * @template T
     * @param {Uint8Array} bytes
     * @returns {Query<T>}
     */
    static fromBytes(bytes) {
        const query = HashgraphProto.proto.Query.decode(bytes);

        if (query.query == null) {
            throw new Error("(BUG) query.query was not set in the protobuf");
        }

        const fromProtobuf =
            /** @type {(query: HashgraphProto.proto.IQuery) => Query<T>} */ (
                QUERY_REGISTRY.get(query.query)
            );

        if (fromProtobuf == null) {
            throw new Error(
                `(BUG) Query.fromBytes() not implemented for type ${query.query}`
            );
        }

        return fromProtobuf(query);
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.Query.encode(this._makeRequest()).finish();
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
     * @param {import("../client/Client.js").default<Channel, *>} client
     * @returns {Promise<Hbar>}
     */
    getCost(client) {
        if (this._nodeAccountIds.isEmpty) {
            this._nodeAccountIds.setList(
                client._network.getNodeAccountIdsForExecute()
            );
        }

        if (COST_QUERY.length != 1) {
            throw new Error("CostQuery has not been loaded yet");
        }

        this._timestamp = Date.now();

        return COST_QUERY[0](this).execute(client);
    }

    /**
     * @param {TransactionId} paymentTransactionId
     * @returns {this}
     */
    setPaymentTransactionId(paymentTransactionId) {
        this._paymentTransactionId = paymentTransactionId;
        return this;
    }

    /**
     * @returns {?TransactionId}
     */
    get paymentTransactionId() {
        return this._paymentTransactionId;
    }

    /**
     * @returns {TransactionId}
     */
    _getTransactionId() {
        if (this._paymentTransactionId == null) {
            throw new Error(
                "Query.PaymentTransactionId was not set duration execution"
            );
        }

        return this._paymentTransactionId;
    }

    /**
     * @protected
     * @returns {boolean}
     */
    _isPaymentRequired() {
        return true;
    }

    /**
     * @param {Client} client
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    _validateChecksums(client) {
        // Do nothing
    }

    /**
     * @template MirrorChannelT
     * @param {import("../client/Client.js").default<Channel, MirrorChannelT>} client
     * @returns {Promise<void>}
     */
    async _beforeExecute(client) {
        if (this._paymentTransactions.length > 0) {
            return;
        }

        if (client.isAutoValidateChecksumsEnabled()) {
            this._validateChecksums(client);
        }

        if (this._nodeAccountIds.isEmpty) {
            this._nodeAccountIds.setList(
                client._network.getNodeAccountIdsForExecute()
            );
        }

        this._operator =
            this._operator != null ? this._operator : client._operator;

        if (this._paymentTransactionId == null) {
            if (this._isPaymentRequired()) {
                if (this._operator != null) {
                    this._paymentTransactionId = TransactionId.generate(
                        this._operator.accountId
                    );
                } else {
                    throw new Error(
                        "`client` must have an `operator` or an explicit payment transaction must be provided"
                    );
                }
            } else {
                this._paymentTransactionId = TransactionId.generate(
                    new AccountId(0)
                );
            }
        }

        let cost =
            this._queryPayment != null
                ? this._queryPayment
                : client.maxQueryPayment;

        if (
            this._paymentTransactions.length !== 0 ||
            !this._isPaymentRequired()
        ) {
            cost = new Hbar(0);
        } else {
            if (this._queryPayment == null) {
                const actualCost = await this.getCost(client);

                if (
                    cost.toTinybars().toInt() < actualCost.toTinybars().toInt()
                ) {
                    throw new MaxQueryPaymentExceeded(cost, actualCost);
                }

                cost = actualCost;
                Logger.debug(
                    `[${this._getLogId()}] received cost for query ${cost.toString()}`
                );
            }
        }

        this._queryPayment = cost;

        if (this._nodeAccountIds.locked) {
            for (const node of this._nodeAccountIds.list) {
                this._paymentTransactions.push(
                    await _makePaymentTransaction(
                        this._getLogId(),
                        /** @type {import("../transaction/TransactionId.js").default} */ (
                            this._paymentTransactionId
                        ),
                        node,
                        this._isPaymentRequired() ? this._operator : null,
                        /** @type {Hbar} */ (cost)
                    )
                );
            }
        }

        this._timestamp = Date.now();
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapResponseHeader(response) {
        throw new Error("not implemented");
    }

    /**
     * @protected
     * @returns {HashgraphProto.proto.IQueryHeader}
     */
    _makeRequestHeader() {
        /** @type {HashgraphProto.proto.IQueryHeader} */
        let header = {};

        if (this._isPaymentRequired() && this._paymentTransactions.length > 0) {
            header = {
                responseType: HashgraphProto.proto.ResponseType.ANSWER_ONLY,
                payment: this._paymentTransactions[this._nodeAccountIds.index],
            };
        }

        return header;
    }

    /**
     * @abstract
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _onMakeRequest(header) {
        throw new Error("not implemented");
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IQuery}
     */
    _makeRequest() {
        /** @type {HashgraphProto.proto.IQueryHeader} */
        let header = {};

        if (this._isPaymentRequired() && this._paymentTransactions != null) {
            header = {
                payment: this._paymentTransactions[this._nodeAccountIds.index],
                responseType: HashgraphProto.proto.ResponseType.ANSWER_ONLY,
            };
        }

        return this._onMakeRequest(header);
    }

    /**
     * @override
     * @internal
     * @returns {Promise<HashgraphProto.proto.IQuery>}
     */
    async _makeRequestAsync() {
        /** @type {HashgraphProto.proto.IQueryHeader} */
        let header = {};

        if (this._isPaymentRequired() && this._paymentTransactions != null) {
            if (this._nodeAccountIds.locked) {
                header = {
                    payment:
                        this._paymentTransactions[this._nodeAccountIds.index],
                    responseType: HashgraphProto.proto.ResponseType.ANSWER_ONLY,
                };
            } else {
                header = {
                    payment: await _makePaymentTransaction(
                        this._getLogId(),
                        /** @type {import("../transaction/TransactionId.js").default} */ (
                            this._paymentTransactionId
                        ),
                        this._nodeAccountIds.current,
                        this._isPaymentRequired() ? this._operator : null,
                        /** @type {Hbar} */ (this._queryPayment)
                    ),
                    responseType: HashgraphProto.proto.ResponseType.ANSWER_ONLY,
                };
            }
        }

        return this._onMakeRequest(header);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {ExecutionState}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _shouldRetry(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        const status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : HashgraphProto.proto.ResponseCodeEnum.OK
        );

        Logger.debug(
            `[${this._getLogId()}] received status ${status.toString()}`
        );

        switch (status) {
            case Status.Busy:
            case Status.Unknown:
            case Status.PlatformTransactionNotCreated:
                return ExecutionState.Retry;
            case Status.Ok:
                return ExecutionState.Finished;
            default:
                return ExecutionState.Error;
        }
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Error}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mapStatusError(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        const status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : HashgraphProto.proto.ResponseCodeEnum.OK
        );

        return new PrecheckStatusError({
            status,
            transactionId: this._getTransactionId(),
        });
    }

    /**
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

/**
 * @param {string} logId
 * @param {TransactionId} paymentTransactionId
 * @param {AccountId} nodeId
 * @param {?ClientOperator} operator
 * @param {Hbar} paymentAmount
 * @returns {Promise<HashgraphProto.proto.ITransaction>}
 */
export async function _makePaymentTransaction(
    logId,
    paymentTransactionId,
    nodeId,
    operator,
    paymentAmount
) {
    Logger.debug(
        `[${logId}] making a payment transaction for node ${nodeId.toString()} and transaction ID ${paymentTransactionId.toString()} with amount ${paymentAmount.toString()}`
    );
    const accountAmounts = [];

    if (operator != null) {
        accountAmounts.push({
            accountID: operator.accountId._toProtobuf(),
            amount: paymentAmount.negated().toTinybars(),
        });
        accountAmounts.push({
            accountID: nodeId._toProtobuf(),
            amount: paymentAmount.toTinybars(),
        });
    } else {
        accountAmounts.push({
            accountID: new AccountId(0)._toProtobuf(),
            amount: paymentAmount.negated().toTinybars(),
        });
        accountAmounts.push({
            accountID: nodeId._toProtobuf(),
            amount: paymentAmount.toTinybars(),
        });
    }
    /**
     * @type {HashgraphProto.proto.ITransactionBody}
     */
    const body = {
        transactionID: paymentTransactionId._toProtobuf(),
        nodeAccountID: nodeId._toProtobuf(),
        transactionFee: new Hbar(1).toTinybars(),
        transactionValidDuration: {
            seconds: Long.fromNumber(120),
        },
        cryptoTransfer: {
            transfers: {
                accountAmounts,
            },
        },
    };

    /** @type {HashgraphProto.proto.ISignedTransaction} */
    const signedTransaction = {
        bodyBytes: HashgraphProto.proto.TransactionBody.encode(body).finish(),
    };

    if (operator != null) {
        const signature = await operator.transactionSigner(
            /** @type {Uint8Array} */ (signedTransaction.bodyBytes)
        );

        signedTransaction.sigMap = {
            sigPair: [operator.publicKey._toProtobufSignature(signature)],
        };
    }

    return {
        signedTransactionBytes:
            HashgraphProto.proto.SignedTransaction.encode(
                signedTransaction
            ).finish(),
    };
}

/**
 * @type {((query: Query<*>) => import("./CostQuery.js").default<*>)[]}
 */
export const COST_QUERY = [];
