import axios from "axios";
import ContractFunctionParameters from "../contract/ContractFunctionParameters.js";

/**
 * @typedef {import("../contract/ContractId").default} ContractId
 * @typedef {import("../account/AccountId").default} AccountId
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("axios").AxiosResponse} AxiosResponse
 *
 */

/**
 * MirrorNodeContractQuery returns a result from EVM execution such as cost-free execution of read-only smart contract
 * queries, gas estimation, and transient simulation of read-write operations.
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
     * @description Sets the contract instance to call.
     * @returns {this}
     */
    setContractId(contractId) {
        this._contractId = contractId;
        return this;
    }

    /**
     * @param {AccountId} sender
     * @description Sets the sender of the transaction simulation.
     * @returns {this}
     */
    setSender(sender) {
        this._sender = sender;
        return this;
    }

    /**
     *
     * @param {string} sender
     * @description Set the 20-byte EVM address of the sender.
     * @returns {this}
     */
    setSenderEvmAddress(sender) {
        this._senderEvmAddress = sender;
        return this;
    }

    /**
     *
     * @param {string} name
     * @param {ContractFunctionParameters} functionParameters
     * @description Sets the function to call, and the parameters to pass to the function
     * @returns {this}
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
     * @description Sets the amount of value (in tinybars or wei) to be sent to the contract in the transaction.
     * Use this to specify an amount for a payable function call.
     * @returns {this}
     */
    setValue(value) {
        this._value = value;
        return this;
    }

    /**
     * @param {Long} gasLimit
     * @description Sets the gas limit for the contract call.
     * This specifies the maximum amount of gas that the transaction can consume.
     * @returns {this}
     */
    setGasLimit(gasLimit) {
        this._gasLimit = gasLimit;
        return this;
    }

    /**
     * @param {Long} gasPrice
     * @description Sets the gas price to be used for the contract call. This specifies the price of each unit of gas used in the transaction.
     * @returns {this}
     */
    setGasPrice(gasPrice) {
        this._gasPrice = gasPrice;
        return this;
    }

    /**
     * @param {Long} blockNumber
     * @description  Sets the block number for the simulation of the contract call.
     * The block number determines the context of the contract call simulation within the blockchain.
     * @returns {this}
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
     * @returns {string | null }
     */
    get senderEvmAddress() {
        if (this.sender) {
            return this.sender.toSolidityAddress();
        } else if (this._senderEvmAddress) {
            return this._senderEvmAddress;
        }

        return null;
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
     * @param {Client} client
     * @param {object} jsonPayload
     * @returns {Promise<AxiosResponse>}
     */
    async performMirrorNodeRequest(client, jsonPayload) {
        if (this.contractId == null) {
            throw new Error("Contract ID is not set");
        }
        let mirrorNetworkAddress = client.mirrorNetwork[0];
        const contractCallEndpoint = "/api/v1/contracts/call";

        if (!client.ledgerId || client.ledgerId?.isLocalNode()) {
            mirrorNetworkAddress = "http://"
                .concat(client.mirrorNetwork[0].replace("5600", "8545"))
                .concat(contractCallEndpoint);
        } else {
            let trimmed = client.mirrorNetwork[0].split(":");
            mirrorNetworkAddress = "https://"
                .concat(trimmed[0])
                .concat(contractCallEndpoint);
        }

        let result = await axios.post(mirrorNetworkAddress, jsonPayload);
        return result;
    }

    // eslint-disable-next-line jsdoc/require-returns-check
    /**
     * @returns {object}
     */
    get JSONPayload() {
        throw new Error(
            "JSONPayload getter is not implemented. Please implement this method in the subclass.",
        );
    }
}
