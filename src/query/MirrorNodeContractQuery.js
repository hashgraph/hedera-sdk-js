import axios from "axios";
import { ContractFunctionParameters } from "../exports.js";

/**
 * @typedef {import("../contract/ContractId").default} ContractId
 * @typedef {import("../account/AccountId").default} AccountId
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("axios").AxiosResponse} AxiosResponse
 *
 */
export default class MirrorNodeContractQuery {
    constructor() {
        this._contractId = null;
        this._contractEvmAddress = null;
        this._sender = null;
        this._senderEvmAddress = null;
        this._functionName = null;
        this._functionParameters = null;
        this._value = null;
        this._gasLimit = null;
        this._gasPrice = null;
        this._blockNumber = null;
    }

    /**
     *
     * @param {ContractId} contractId
     * @returns
     */
    setContractId(contractId) {
        this._contractId = contractId;
        return this;
    }

    /**
     * @param {AccountId} sender
     * @returns
     */
    setSender(sender) {
        this._sender = sender;
        return this;
    }

    /**
     *
     * @param {string} name
     * @param {ContractFunctionParameters} functionParameters
     * @returns
     */
    setFunction(name, functionParameters) {
        this._functionParameters =
            functionParameters != null
                ? functionParameters._build(name)
                : new ContractFunctionParameters()._build(name);

        return this;
    }

    /**
     * @param {Long} value
     * @returns
     */
    setValue(value) {
        this._value = value;
        return this;
    }

    /**
     * @param {Long} gasLimit
     * @returns
     */
    setGasLimit(gasLimit) {
        this._gasLimit = gasLimit;
        return this;
    }

    /**
     * @param {Long} gasPrice
     * @returns
     */
    setGasPrice(gasPrice) {
        this._gasPrice = gasPrice;
        return this;
    }

    /**
     * @param {Long} blockNumber
     * @returns
     */
    setBlockNumber(blockNumber) {
        this._blockNumber = blockNumber;
        return this;
    }

    /**
     * @returns {ContractId?}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * @returns {string}
     */
    get contractEvmAddress() {
        const solidityAddress = this._contractId?.toSolidityAddress();
        if (solidityAddress == null) {
            throw new Error("Contract ID is not set");
        }
        return solidityAddress;
    }

    /**
     * @returns {AccountId?}
     */
    get sender() {
        return this._sender;
    }

    /**
     * @returns {string?}
     */
    get senderEvmAddress() {
        const solidityAddress = this._sender?.toSolidityAddress();
        if (solidityAddress == null) {
            throw new Error("Sender is not set");
        }
        return solidityAddress;
    }

    /**
     * @returns {Uint8Array | null | undefined}
     */
    get callData() {
        return this._functionParameters;
    }

    /**
     * @returns {Long?}
     */
    get value() {
        return this._value;
    }

    /**
     * @returns {Long?}
     */
    get gasLimit() {
        return this._gasLimit;
    }

    /**
     * @returns {Long?}
     */
    get gasPrice() {
        return this._gasPrice;
    }

    /**
     * @returns {Long?}
     */
    get blockNumber() {
        return this._blockNumber;
    }

    /**
     *
     * @param {string} apiEndpoint
     * @param {string} jsonPayload
     * @returns {Promise<AxiosResponse>}
     */
    async performMirrorNodeRequest(apiEndpoint, jsonPayload) {
        if (this.contractId == null) {
            throw new Error("Contract ID is not set");
        }

        const MIRROR_NETWORK_ADDRESS =
            "https://testnet.mirrornode.hedera.com/api/v1/" + apiEndpoint;

        let result = await axios.post(MIRROR_NETWORK_ADDRESS, jsonPayload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return result;
    }
}
