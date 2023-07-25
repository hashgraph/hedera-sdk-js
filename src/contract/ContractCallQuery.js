/*-
 * ‌
 * Hedera JavaScript SDK
 * ​
 * Copyright (C) 2020 - 2023 Hedera Hashgraph, LLC
 * ​
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ‍
 */

import Query, { QUERY_REGISTRY } from "../query/Query.js";
import ContractId from "./ContractId.js";
import AccountId from "../account/AccountId.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
import ContractFunctionResult from "./ContractFunctionResult.js";
import Long from "long";
import * as HashgraphProto from "@hashgraph/proto";
import PrecheckStatusError from "../PrecheckStatusError.js";
import Status from "../Status.js";

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
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
     * @param {FunctionParameters | Uint8Array} [props.functionParameters]
     * @param {number | Long} [props.maxResultSize]
     * @param {AccountId | string} [props.senderAccountId]
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
            if (props.functionParameters instanceof Uint8Array) {
                this.setFunctionParameters(props.functionParameters);
            } else {
                this.setFunction(
                    props.functionParameters.name,
                    props.functionParameters.parameters
                );
            }
        }

        /**
         * @private
         * @type {?Long}
         */
        this._maxResultSize = null;
        if (props.maxResultSize != null) {
            this.setMaxResultSize(props.maxResultSize);
        }

        /**
         * @private
         * @type {?AccountId}
         */
        this._senderAccountId = null;
        if (props.senderAccountId != null) {
            this.setSenderAccountId(props.senderAccountId);
        }
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IQuery} query
     * @returns {ContractCallQuery}
     */
    static _fromProtobuf(query) {
        const call =
            /** @type {HashgraphProto.proto.IContractCallLocalQuery} */ (
                query.contractCallLocal
            );

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
            typeof contractId === "string"
                ? ContractId.fromString(contractId)
                : contractId.clone();

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
     * @returns {?AccountId}
     */
    get senderAccountId() {
        return this._senderAccountId;
    }

    /**
     * @param {AccountId | string} senderAccountId
     * @returns {ContractCallQuery}
     */
    setSenderAccountId(senderAccountId) {
        this._senderAccountId =
            typeof senderAccountId === "string"
                ? AccountId.fromString(senderAccountId)
                : senderAccountId;
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
        this._functionParameters = (
            params != null ? params : new ContractFunctionParameters()
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
     * @param {Client} client
     */
    _validateChecksums(client) {
        if (this._contractId != null) {
            this._contractId.validateChecksum(client);
        }
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQuery} request
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Error}
     */
    _mapStatusError(request, response) {
        const { nodeTransactionPrecheckCode } =
            this._mapResponseHeader(response);

        const status = Status._fromCode(
            nodeTransactionPrecheckCode != null
                ? nodeTransactionPrecheckCode
                : HashgraphProto.proto.ResponseCodeEnum.OK
        );

        const call =
            /**
             *@type {HashgraphProto.proto.IContractCallLocalResponse}
             */
            (response.contractCallLocal);
        if (!call.functionResult) {
            return new PrecheckStatusError({
                status,
                transactionId: this._getTransactionId(),
                contractFunctionResult: null,
            });
        }

        const contractFunctionResult = this._mapResponseSync(response);

        return new PrecheckStatusError({
            status,
            transactionId: this._getTransactionId(),
            contractFunctionResult,
        });
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {HashgraphProto.proto.IQuery} request
     * @returns {Promise<HashgraphProto.proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.contractCallLocalMethod(request);
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {HashgraphProto.proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractCallLocal =
            /** @type {HashgraphProto.proto.IContractCallLocalResponse} */ (
                response.contractCallLocal
            );
        return /** @type {HashgraphProto.proto.IResponseHeader} */ (
            contractCallLocal.header
        );
    }

    /**
     * @protected
     * @override
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {Promise<ContractFunctionResult>}
     */
    _mapResponse(response) {
        const call =
            /**
             *@type {HashgraphProto.proto.IContractCallLocalResponse}
             */
            (response.contractCallLocal);

        return Promise.resolve(
            ContractFunctionResult._fromProtobuf(
                /**
                 * @type {HashgraphProto.proto.IContractFunctionResult}
                 */
                (call.functionResult),
                false
            )
        );
    }

    /**
     * @private
     * @param {HashgraphProto.proto.IResponse} response
     * @returns {ContractFunctionResult}
     */
    _mapResponseSync(response) {
        const call =
            /**
             *@type {HashgraphProto.proto.IContractCallLocalResponse}
             */
            (response.contractCallLocal);

        return ContractFunctionResult._fromProtobuf(
            /**
             * @type {HashgraphProto.proto.IContractFunctionResult}
             */
            (call.functionResult),
            false
        );
    }

    /**
     * @override
     * @internal
     * @param {HashgraphProto.proto.IQueryHeader} header
     * @returns {HashgraphProto.proto.IQuery}
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
                maxResultSize: this._maxResultSize,
                functionParameters: this._functionParameters,
                senderId:
                    this._senderAccountId != null
                        ? this._senderAccountId._toProtobuf()
                        : null,
            },
        };
    }

    /**
     * @returns {string}
     */
    _getLogId() {
        const timestamp =
            this._paymentTransactionId != null &&
            this._paymentTransactionId.validStart != null
                ? this._paymentTransactionId.validStart
                : this._timestamp;

        return `ContractCallQuery:${timestamp.toString()}`;
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractCallLocal", ContractCallQuery._fromProtobuf);
