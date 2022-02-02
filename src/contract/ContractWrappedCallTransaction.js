import Hbar from "../Hbar.js";
import AccountId from "../account/AccountId.js";
import Transaction, {TRANSACTION_REGISTRY} from "../transaction/Transaction.js";
import Long from "long";
import WrappedTransactionType from "./WrappedTransactionType.js";
import ContractId from "./ContractId.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITransaction} proto.ITransaction
 * @typedef {import("@hashgraph/proto").ISignedTransaction} proto.ISignedTransaction
 * @typedef {import("@hashgraph/proto").TransactionBody} proto.TransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionBody} proto.ITransactionBody
 * @typedef {import("@hashgraph/proto").ITransactionResponse} proto.ITransactionResponse
 * @typedef {import("@hashgraph/proto").IContractWrappedCallTransactionBody} proto.IContractWrappedCallTransactionBody
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 * @typedef {import("@hashgraph/proto").IFileID} proto.IFileID
 */

/**
 * @typedef {import("bignumber.js").default} BigNumber
 * @typedef {import("../channel/Channel.js").default} Channel
 * @typedef {import("../client/Client.js").default<*, *>} Client
 * @typedef {import("../transaction/TransactionId.js").default} TransactionId
 */

export default class ContractWrappedCallTransaction extends Transaction {
    /**
     * @param {object} [props]
     * @param {WrappedTransactionType} [props.wrappedTransactionType]
     * @param {Uint8Array} [props.foreignTransactionBytes]
     * @param {Long} [props.nonce]
     * @param {number} [props.functionParameterStart]
     * @param {number} [props.functionParameterLength]
     * @param {ContractId | string} [props.contractId]
     * @param {Long} [props.gas]
     * @param {Long} [props.amount]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?WrappedTransactionType}
         */
        this._wrappedTransactionType = null;

        /**
         * @private
         * @type {?Uint8Array}
         */
        this._foreignTransactionBytes = null;

        /**
         * @private
         * @type {?Long}
         */
        this._nonce = null;

        /**
         * @private
         * @type {?number}
         */
        this._functionParameterStart = null;

        /**
         * @private
         * @type {?number}
         */
        this._functionParameterLength = null;

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
         * @type {?Long}
         */
        this._amount = null;

        this.setMaxTransactionFee(new Hbar(20));

        if (props.wrappedTransactionType != null) {
            this.setWrappedTransactionType(props.wrappedTransactionType);
        }

        if (props.foreignTransactionBytes != null) {
            this.setForeignTransactionBytes(props.foreignTransactionBytes);
        }

        if (props.nonce != null) {
            this.setNonce(props.nonce);
        }

        if (props.functionParameterStart != null) {
            this.setFunctionParameterStart(props.functionParameterStart);
        }

        if (props.functionParameterLength != null) {
            this.setFunctionParameterLength(props.functionParameterLength);
        }

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        if (props.gas != null) {
            this.setGas(props.gas);
        }

        if (props.amount != null) {
            this.setAmount(props.amount);
        }
    }

    /**
     * @internal
     * @param {proto.ITransaction[]} transactions
     * @param {proto.ISignedTransaction[]} signedTransactions
     * @param {TransactionId[]} transactionIds
     * @param {AccountId[]} nodeIds
     * @param {proto.ITransactionBody[]} bodies
     * @returns {ContractWrappedCallTransaction}
     */
    static _fromProtobuf(
        transactions,
        signedTransactions,
        transactionIds,
        nodeIds,
        bodies
    ) {
        const body = bodies[0];
        const create = /** @type {proto.IContractWrappedCallTransactionBody} */ (
            body.contractWrappedCall
        );

        return Transaction._fromProtobufTransactions(
            new ContractWrappedCallTransaction({
                wrappedTransactionType:
                    create.wrappedTransactionType != null
                        ? WrappedTransactionType._fromCode((create.wrappedTransactionType))
                        : undefined,
                foreignTransactionBytes:
                    create.foreignTransactionBytes != null
                        ? create.foreignTransactionBytes
                        : undefined,
                nonce:
                    create.nonce != null
                        ? create.nonce
                        : undefined,
                functionParameterStart:
                    create.functionParameterStart != null
                        ? create.functionParameterStart
                        : undefined,
                functionParameterLength:
                    create.functionParameterLength != null
                        ? create.functionParameterLength
                        : undefined,
                contractId:
                    create.contractId != null
                        ? ContractId._fromProtobuf(create.contractId)
                        : undefined,
                gas: create.gas != null ? create.gas : undefined,
                amount: create.amount != null ? create.amount : undefined,
            }),
            transactions,
            signedTransactions,
            transactionIds,
            nodeIds,
            bodies
        );
    }

    /**
     * @returns {?WrappedTransactionType}
     */
    get wrappedTransactionType() {
        return this._wrappedTransactionType;
    }

    /**
     * @param {WrappedTransactionType} wrappedTransactionType
     * @returns {this}
     */
    setWrappedTransactionType(wrappedTransactionType) {
        this._requireNotFrozen();
        this._wrappedTransactionType = wrappedTransactionType;

        return this;
    }

    /**
     * @returns {?Uint8Array}
     */
    get foreignTransactionBytes() {
        return this._foreignTransactionBytes;
    }

    /**
     * @param {Uint8Array} foreignTransactionBytes
     * @returns {this}
     */
    setForeignTransactionBytes(foreignTransactionBytes) {
        this._requireNotFrozen();
        this._constructorParameters =
            foreignTransactionBytes != null
                ? foreignTransactionBytes
                : null;

        return this;
    }

    /**
     * @returns {?Long}
     */
    get nonce() {
        return this._nonce;
    }

    /**
     * @param {number | Long} nonce
     * @returns {this}
     */
    setNonce(nonce) {
        this._requireNotFrozen();
        this._nonce = nonce instanceof Long ? nonce : Long.fromValue(nonce);

        return this;
    }

    /**
     * @returns {?number}
     */
    get functionParameterStart() {
        return this._functionParameterStart;
    }

    /**
     * @param {number} functionParameterStart
     * @returns {this}
     */
    setFunctionParameterStart(functionParameterStart) {
        this._requireNotFrozen();
        this._functionParameterStart = functionParameterStart != null ? functionParameterStart : null;

        return this;
    }

    /**
     * @returns {?number}
     */
    get functionParameterLength() {
        return this._functionParameterLength;
    }

    /**
     * @param {number} functionParameterLength
     * @returns {this}
     */
    setFunctionParameterLength(functionParameterLength) {
        this._requireNotFrozen();
        this._functionParameterLength = functionParameterLength != null
            ? functionParameterLength
            : null;

        return this;
    }

    /**
     * @returns {?ContractId}
     */
    get contractId() {
        return this._contractId;
    }

    /**
     * @param {ContractId | string} contractId
     * @returns {this}
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
    get gas() {
        return this._gas;
    }

    /**
     * @param {number | Long} gas
     * @returns {this}
     */
    setGas(gas) {
        this._requireNotFrozen();
        this._gas = gas instanceof Long ? gas : Long.fromValue(gas);

        return this;
    }

    /**
     * @returns {?Long}
     */
    get amount() {
        return this._amount;
    }

    /**
     * Set the initial amount to transfer into this contract.
     *
     * @param {number | Long} amount
     * @returns {this}
     */
    setAmount(amount) {
        this._requireNotFrozen();
        this._amount = amount instanceof Long ? amount : Long.fromValue(amount);

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
        return channel.smartContract.contractWrappedCall(request);
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "contractWrappedCall";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IContractWrappedCallTransactionBody}
     */
    _makeTransactionData() {
        return {
            wrappedTransactionType:
                this._wrappedTransactionType != null
                    ? this._wrappedTransactionType.valueOf()
                    : null,
            foreignTransactionBytes:
                this._foreignTransactionBytes != null
                    ? this._foreignTransactionBytes
                    : null,
            nonce: this._nonce,
            functionParameterStart: this._functionParameterStart,
            functionParameterLength: this._functionParameterLength,
            contractId:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
            gas: this._gas,
            amount: this._amount,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "contractWrappedCall",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractWrappedCallTransaction._fromProtobuf
);
