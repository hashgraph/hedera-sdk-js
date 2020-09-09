import proto from "@hashgraph/proto";
import Channel from "../Channel";
import Transaction from "../Transaction";
import { _toProtoKey } from "../util";
import ContractId from "./ContractId";
import Hbar from "../Hbar";
import ContractFunctionParameters from "./ContractFunctionParameters";
import Long from "long";
import BigNumber from "bignumber.js";

/**
 * @typedef {object} FunctionParameters
 * @property {string} name
 * @property {ContractFunctionParameters} functionParameters
 */

export default class ContractExecuteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {ContractId | string} [props.contractId]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.amount]
     * @param {Uint8Array | FunctionParameters} [props.functionParameters]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;

        /**
         * @private
         * @type {?Long}
         */
        this._gas = null;

        /**
         * @private
         * @type {?Hbar}
         */
        this._amount = null;

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._functionParameters = null;

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        if (props.gas != null) {
            this.setGas(props.gas);
        }

        if (props.amount != null) {
            this.setPayableAmount(props.amount);
        }

        if (props.functionParameters != null) {
            if (props.functionParameters instanceof Uint8Array) {
                this.setFunctionParameters(props.functionParameters);
            } else {
                this.setFunction(
                    props.functionParameters.name,
                    props.functionParameters.functionParameters
                );
            }
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {ContractExecuteTransaction}
     */
    static _fromProtobuf(body) {
        const call = /** @type {proto.IContractCallTransactionBody} */ (body.contractCall);

        return new ContractExecuteTransaction({
            contractId:
                call.contractID != null
                    ? ContractId._fromProtobuf(
                          /** @type {proto.ContractID} */ (call.contractID)
                      )
                    : undefined,
            gas: call.gas ?? undefined,
            amount: call.amount ?? undefined,
            functionParameters: call.functionParameters ?? undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    getContractId() {
        return this._contractId;
    }

    /**
     * Sets the contract ID which is being executed in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractExecuteTransaction}
     */
    setContractId(contractId) {
        this._requireNotFrozen();
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
     * Sets the contract ID which is being executed in this transaction.
     *
     * @param {number | Long} gas
     * @returns {ContractExecuteTransaction}
     */
    setGas(gas) {
        this._requireNotFrozen();
        this._gas = gas instanceof Long ? gas : Long.fromValue(gas);

        return this;
    }

    /**
     * @returns {?Hbar}
     */
    getPayableAmount() {
        return this._amount;
    }

    /**
     * Sets the contract ID which is being executed in this transaction.
     *
     * @param {number | string | Long | BigNumber | Hbar} amount
     * @returns {ContractExecuteTransaction}
     */
    setPayableAmount(amount) {
        this._requireNotFrozen();
        this._amount = amount instanceof Hbar ? amount : new Hbar(amount);

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    getFunctionParameters() {
        return this._functionParameters;
    }

    /**
     * @param {Uint8Array} functionParameters
     */
    setFunctionParameters(functionParameters) {
        this._requireNotFrozen();
        this._functionParameters = functionParameters;
    }

    /**
     * @param {string} name
     * @param {ContractFunctionParameters} [functionParameters]
     * @returns {this}
     */
    setFunction(name, functionParameters) {
        this._requireNotFrozen();
        this._functionParameters =
            functionParameters != null
                ? functionParameters._build(name)
                : new ContractFunctionParameters()._build(name);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.TransactionResponse>}
     */
    _getMethod(channel) {
        return (transaction) =>
            channel.smartContract.contractCallMethod(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "contractCall";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IContractCallTransactionBody}
     */
    _makeTransactionData() {
        return {
            contractID: this._contractId?._toProtobuf(),
            gas: this._gas,
            amount: this._amount?.toTinybars(),
            functionParameters: this._functionParameters,
        };
    }
}
