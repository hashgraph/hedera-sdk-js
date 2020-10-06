import Query, { QUERY_REGISTRY } from "../query/Query";
import ContractId from "./ContractId";
import ContractFunctionParameters from "./ContractFunctionParameters";
import ContractFunctionResult from "./ContractFunctionResult";
import Long from "long";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IContractCallLocalQuery} proto.IContractCallLocalQuery
 * @typedef {import("@hashgraph/proto").IContractCallLocalResponse} proto.IContractCallLocalResponse
 * @typedef {import("@hashgraph/proto").IContractFunctionResult} proto.IContractFunctionResult
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 */

/**
 * @typedef {object} FunctionParameters
 * @property {ContractFunctionParameters} parameters
 * @property {string} name
 */

/**
 * @augments {Query<ContractFunctionResult>}
 */
export default class ContractCallQuery extends Query {
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     * @param {number | Long} [props.gas]
     * @param {Uint8Array} [props.functionParameters]
     * @param {FunctionParameters} [props.function]
     * @param {number | Long} [props.maxResultSize]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._gas = null;

        if (props.gas != null) {
            this.setGas(props.gas);
        }

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._functionParameters = null;

        if (props.functionParameters != null) {
            this.setFunctionParameters(props.functionParameters);
        } else if (props.function != null) {
            this.setFunction(props.function.name, props.function.parameters);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._maxResultSize = null;
        if (props.maxResultSize != null) {
            this.setMaxResultSize(props.maxResultSize);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {ContractCallQuery}
     */
    static _fromProtobuf(query) {
        const call = /** @type {proto.IContractCallLocalQuery} */ (query.contractCallLocal);

        return new ContractCallQuery({
            contractId:
                call.contractID != null
                    ? ContractId._fromProtobuf(call.contractID)
                    : undefined,
            gas: call.gas != null ? call.gas : undefined,
            functionParameters:
                call.functionParameters != null
                    ? call.functionParameters
                    : undefined,
            maxResultSize:
                call.maxResultSize != null ? call.maxResultSize : undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * Set the contract ID for which the call is being requested.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractCallQuery}
     */
    setContractId(contractId) {
        this._contractId =
            contractId instanceof ContractId
                ? contractId
                : ContractId.fromString(contractId);

        return this;
    }

    /**
     * @returns {?Long}
     */
    get gas() {
        return this._gas;
    }

    /**
     * @param {number | Long} gas
     * @returns {ContractCallQuery}
     */
    setGas(gas) {
        this._gas = gas instanceof Long ? gas : Long.fromValue(gas);
        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get functionParameters() {
        return this._functionParameters;
    }

    /**
     * @param {Uint8Array} params
     * @returns {ContractCallQuery}
     */
    setFunctionParameters(params) {
        this._functionParameters = params;
        return this;
    }

    /**
     * @param {string} name
     * @param {?ContractFunctionParameters} [params]
     * @returns {ContractCallQuery}
     */
    setFunction(name, params) {
        this._functionParameters = (params != null
            ? params
            : new ContractFunctionParameters()
        )._build(name);

        return this;
    }

    /**
     * @param {number | Long} size
     * @returns {ContractCallQuery}
     */
    setMaxResultSize(size) {
        this._maxResultSize =
            size instanceof Long ? size : Long.fromValue(size);
        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.contractCallLocalMethod(request);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractCallLocal = /** @type {proto.IContractCallLocalResponse} */ (response.contractCallLocal);
        return /** @type {proto.IResponseHeader} */ (contractCallLocal.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<ContractFunctionResult>}
     */
    _mapResponse(response) {
        const call =
            /**
             *@type {proto.IContractCallLocalResponse}
             */
            (response.contractCallLocal);

        return Promise.resolve(
            ContractFunctionResult._fromProtobuf(
                /**
                 * @type {proto.IContractFunctionResult}
                 */
                (call.functionResult)
            )
        );
    }

    /**
     * @override
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            contractCallLocal: {
                header: this._makeRequestHeader(),
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
                gas: this._gas,
                functionParameters: this._functionParameters,
                maxResultSize: this._maxResultSize,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractCallLocal", ContractCallQuery._fromProtobuf);
