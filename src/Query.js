import proto from "@hashgraph/proto";
import Client from "./Client.js";
import Hbar from "./Hbar";
import AccountId from "./account/AccountId";
import Channel from "./Channel.js";
import ContractCallQuery from "./contract/ContractCallQuery.js";
import NetworkVersionInfoQuery from "./NetworkVersionInfoQuery.js";
import TopicInfoQuery from "./topic/TopicInfoQuery.js";
import TransactionRecordQuery from "./TransactionRecordQuery.js";
import TransactionReceiptQuery from "./TransactionReceiptQuery.js";
import FileInfoQuery from "./file/FileInfoQuery.js";
import FileContentsQuery from "./file/FileContentsQuery.js";
import AccountStakersQuery from "./account/AccountStakersQuery.js";
import LiveHashQuery from "./account/LiveHashQuery.js";
import AccountInfoQuery from "./account/AccountInfoQuery.js";
import AccountBalanceQuery from "./account/AccountBalanceQuery.js";
import AccountRecordsQuery from "./account/AccountRecordsQuery.js";
import ContractRecordQuery from "./contract/ContractRecordsQuery.js";
import ContractByteCodeQuery from "./contract/ContractByteCodeQuery.js";
import ContractInfoQuery from "./contract/ContractInfoQuery.js";

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
     * @template T
     * @param {Uint8Array} bytes
     * @returns {Query<T>}
     */
    static fromBytes(bytes) {
        const query = proto.Query.decode(bytes);

        let instance;
        switch (query.query) {
            case "contractCallLocal":
                instance = ContractCallQuery._fromProtobuf(query);
                break;
            case "contractGetInfo":
                instance = ContractInfoQuery._fromProtobuf(query);
                break;
            case "contractGetBytecode":
                instance = ContractByteCodeQuery._fromProtobuf(query);
                break;
            case "ContractGetRecords":
                instance = ContractRecordQuery._fromProtobuf(query);
                break;
            case "cryptogetAccountBalance":
                instance = AccountBalanceQuery._fromProtobuf(query);
                break;
            case "cryptoGetAccountRecords":
                instance = AccountRecordsQuery._fromProtobuf(query);
                break;
            case "cryptoGetInfo":
                instance = AccountInfoQuery._fromProtobuf(query);
                break;
            case "cryptoGetLiveHash":
                instance = LiveHashQuery._fromProtobuf(query);
                break;
            case "cryptoGetProxyStakers":
                instance = AccountStakersQuery._fromProtobuf(query);
                break;
            case "fileGetContents":
                instance = FileContentsQuery._fromProtobuf(query);
                break;
            case "fileGetInfo":
                instance = FileInfoQuery._fromProtobuf(query);
                break;
            case "transactionGetReceipt":
                instance = TransactionReceiptQuery._fromProtobuf(query);
                break;
            case "transactionGetRecord":
                instance = TransactionRecordQuery._fromProtobuf(query);
                break;
            case "transactionGetFastRecord":
                instance = TransactionRecordQuery._fromProtobuf(query);
                break;
            case "consensusGetTopicInfo":
                instance = TopicInfoQuery._fromProtobuf(query);
                break;
            case "networkGetVersionInfo":
                instance = NetworkVersionInfoQuery._fromProtobuf(query);
                break;
            default:
                throw new Error(
                    `(BUG) Query.fromBytes() not implemented for type ${
                        query.query ?? ""
                    }`
                );
        }

        return /** @type {Query<T>} */ (/** @type {unknown} */ (instance));
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        const request = this._makeRequest({
            responseType: proto.ResponseType.ANSWER_ONLY,
        });

        return proto.Query.encode(request).finish();
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
