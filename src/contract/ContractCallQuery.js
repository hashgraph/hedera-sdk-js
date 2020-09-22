import Query, { QUERY_REGISTRY } from "../Query";
import ContractId from "./ContractId";
import ContractFunctionParameters from "./ContractFunctionParameters";
import ContractFunctionResult from "./ContractFunctionResult";
import proto from "@hashgraph/proto";
import Long from "long";
import Channel from "../channel/Channel";

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
     * @param {object} properties
     * @param {ContractId | string} [properties.contractId]
     * @param {number | Long} [properties.gas]
     * @param {FunctionParameters | Uint8Array} [properties.functionParameters]
     * @param {number | Long} [properties.maxResultSize]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;
        if (properties.contractId != null) {
            this.setContractId(properties.contractId);
        }

        /**
         * @private
         * @type {?Long}
         */
        this._gas = null;
        if (properties.gas != null) {
            this.setGas(properties.gas);
        }

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._functionParameters = null;
        if (properties.functionParameters != null) {
            if (properties.functionParameters instanceof Uint8Array) {
                this.setFunctionParameters(properties.functionParameters);
            } else {
                this.setFunction(
                    properties.functionParameters.name,
                    properties.functionParameters.parameters
                );
            }
        }

        /**
         * @private
         * @type {?Long}
         */
        this._maxResultSize = null;
        if (properties.maxResultSize != null) {
            this.setMaxResultSize(properties.maxResultSize);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
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
    getContractId() {
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
    getGas() {
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
    getFunctionParameters() {
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
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.smartContract.contractCallLocalMethod(query);
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
     * @returns {ContractFunctionResult}
     */
    _mapResponse(response) {
        const call =
            /**
             *@type {proto.IContractCallLocalResponse}
             */
            (response.contractCallLocal);

        return ContractFunctionResult._fromProtobuf(
            /**
             * @type {proto.IContractFunctionResult}
             */
            (call.functionResult)
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            contractCallLocal: {
                header,
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

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractCallLocal", ContractCallQuery._fromProtobuf);
