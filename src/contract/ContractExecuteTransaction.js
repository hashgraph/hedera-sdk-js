import Hbar from "../Hbar.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import ContractId from "./ContractId.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
import Long from "long";
import { Buffer } from "buffer";
import ForeignTransactionData from "../transaction/ForeignTransactionData.js";
import { HbarUnit } from "../exports.js";
import PublicKey from "../PublicKey.js";
import EthTxInfo from "./EthTxInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IContractCallTransactionBody} proto.IContractCallTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").IContractID} proto.IContractID
 * @typedef {import("@hashgraph/proto").IFileID} proto.IFileID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../account/AccountId.js").default} AccountIdType
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

/**
 * @typedef {object} FunctionParameters
 * @property {string} name
 * @property {ContractFunctionParameters} parameters
 */

export default class ContractExecuteTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {ContractId | string} [props.contractId]
     * @param {number | Long} [props.gas]
     * @param {number | string | Long | BigNumber | Hbar} [props.amount]
     * @param {Uint8Array} [props.functionParameters]
     * @param {FunctionParameters} [props.function]
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
         * @type {?AccountIdType}
         */
        this._senderID = null;

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
            this.setFunctionParameters(props.functionParameters);
        } else if (props.function != null) {
            this.setFunction(props.function.name, props.function.parameters);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountIdType[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {ContractExecuteTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const call = /** @type {proto.IContractCallTransactionBody} */ (
            body.contractCall
        );

        return Transaction._fromProtobufTransactions(
            new ContractExecuteTransaction({
                contractId:
                    call.contractID != null
                        ? ContractId._fromProtobuf(
                              /** @type {proto.IContractID} */ (call.contractID)
                          )
                        : undefined,
                gas: call.gas != null ? call.gas : undefined,
                amount: call.amount ? call.amount : undefined,
                functionParameters:
                    call.functionParameters != null
                        ? call.functionParameters
                        : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?ContractId}
     */
    get contractId() {
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
    get payableAmount() {
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
    get functionParameters() {
        return this._functionParameters;
    }

    /**
     * @param {Uint8Array} functionParameters
     * @returns {this}
     */
    setFunctionParameters(functionParameters) {
        this._requireNotFrozen();
        this._functionParameters = functionParameters;

        return this;
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
     * @param {string} foreignTx
     * @returns {ContractExecuteTransaction}
     */
    populateFromForeignTransaction(foreignTx) {
        const txInfo = EthTxInfo.from(foreignTx);
        console.log(txInfo)
        console.log(foreignTx)
        if (txInfo.senderPubKey != null) {
            this._senderID = PublicKey.fromBytesECDSA(
                txInfo.senderPubKey
            ).toAccountId(0, 0);
        }

        if (
            txInfo.callDataStart != null &&
            txInfo.callDataLength != null &&
            txInfo.nonce != null
        ) {
            const foreignTransactionData = new ForeignTransactionData({
                foreignTransactionType: 2,
                foreignTransactionBytes: Buffer.from(txInfo.transaction, "hex"),
                payloadStart: txInfo.callDataStart,
                payloadLength: txInfo.callDataLength,
                nonce: txInfo.nonce,
            });
            console.log(txInfo)
            console.log(foreignTx)
            console.log(foreignTransactionData)
            this.setForeignTransactionData(
                foreignTransactionData
            );
        }

        if (txInfo.receiver != null) {
            this.setContractId(
                ContractId.fromEvmAddress(
                    0,
                    0,
                    Buffer.from(txInfo.receiver).toString("hex")
                )
            );
        }

        if (txInfo.gasLimit != null) {
            this.setGas(txInfo.gasLimit);
        }

        if (txInfo.amount != null) {
            this.setPayableAmount(
                new Hbar(txInfo.amount.toString(), HbarUnit.Tinybar)
            );
        }

        this._functionParameters = null;

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
     * @param {Channel} channel
     * @param {proto.ITransaction} request
     * @returns {Promise<proto.ITransactionResponse>}
     */
    _execute(channel, request) {
        return channel.smartContract.contractCallMethod(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
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
            senderID:
                this._senderID != null ? this._senderID._toProtobuf() : null,
            contractID:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
            gas: this._gas,
            amount: this._amount != null ? this._amount.toTinybars() : null,
            functionParameters: this._functionParameters,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "contractCall",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractExecuteTransaction._fromProtobuf
);
