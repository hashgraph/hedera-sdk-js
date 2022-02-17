import Hbar from "../Hbar.js";
import Transaction, {
    TRANSACTION_REGISTRY,
} from "../transaction/Transaction.js";
import ContractId from "./ContractId.js";
import ContractFunctionParameters from "./ContractFunctionParameters.js";
import Long from "long";
import RLP from 'rlp';
import {Buffer} from "buffer";
import {bufToBigint} from 'bigint-conversion';
import ForeignTransactionData from "../transaction/ForeignTransactionData.js";
import {AccountId, HbarUnit } from "../exports.js";
import keccak256 from "keccak256";
import PublicKey from "../PublicKey.js";
const secp256k1 = require('secp256k1');

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
        this._senderId = null;

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
        if (foreignTx.startsWith("0x")) {
            foreignTx = foreignTx.substring(2);
        }

        const uintArrayTxn = Buffer.from(foreignTx, 'hex');
        switch (uintArrayTxn[0]) {
            case 1:
                return this.populateFromEIP2930Tx(foreignTx);
            case 2:
                return this.populateFromEIP1559Tx(foreignTx);
            default:
                return this.populateFromEthTx(foreignTx);
        }
    }

    /**
     * @param {string} foreignTx
     * @returns {ContractExecuteTransaction}
     */
    populateFromEIP2930Tx(foreignTx) {
        throw new Error("NIY");
    }

    /**
     * @param {string} foreignTx
     * @returns {ContractExecuteTransaction}
     */
    populateFromEthTx(foreignTx) {
        throw new Error("NIY");
    }

    /**
     * @param {string} foreignTx
     * @returns {ContractExecuteTransaction}
     */
    populateFromEIP1559Tx(foreignTx) {
        var data = Buffer.from(foreignTx.substring(2), 'hex');

        var decoded =
            RLP.decode(Uint8Array.from(data));

        var chainId = ArrayBuffer.isView(decoded[0])
            ? Buffer.from(decoded[0]).readIntBE(0, decoded[0].length)
            : null;

        var nonce = ArrayBuffer.isView(decoded[1])
            ? Buffer.from(decoded[1]).readIntBE(0, decoded[1].length)
            : null;

        var maxPriorityFee = ArrayBuffer.isView(decoded[2])
            ? bufToBigint(Buffer.from(decoded[2]))
            : null;

        var maxGasFee = ArrayBuffer.isView(decoded[3])
            ? bufToBigint(Buffer.from(decoded[3]))
            : null;

        var gasLimit = ArrayBuffer.isView(decoded[4])
            ? Buffer.from(decoded[4]).readIntBE(0, decoded[4].length)
            : null;

        var receiver = ArrayBuffer.isView(decoded[5])
            ? Buffer.from(decoded[5]).toString('hex')
            : null;

        var amount = ArrayBuffer.isView(decoded[6])
            ? bufToBigint(Buffer.from(decoded[6]))
            : null;

        var callData = ArrayBuffer.isView(decoded[7])
            ? Buffer.from(decoded[7])
            : null;

        var callDataStart = callData != null
            ? Buffer.from(foreignTx, 'hex').indexOf(callData)
            : null;

        var callDataLength = callData != null
            ? callData.length
            : null;

        // fixme handle access list?
        // var accessList = decoded[8];

        var recId = null;
        if (ArrayBuffer.isView(decoded[9])) {

            if (Buffer.from(decoded[9]).length === 0) {
                recId = 0;
            }
            else {
                recId = Buffer.from(decoded[9]).readIntBE(0, decoded[9].length);
            }
        }


        var r = ArrayBuffer.isView(decoded[10])
            ? Buffer.from(decoded[10]).toString('hex')
            : null;

        var s = ArrayBuffer.isView(decoded[11])
            ? Buffer.from(decoded[11]).toString('hex')
            : null;

        var senderPubKey = null;

        if (chainId != null
            && nonce != null
            && maxPriorityFee != null
            && maxGasFee != null
            && gasLimit != null
            && receiver != null
            && amount != null
            && callData != null
            && recId != null
            && r != null
            && s != null
        ) {
            senderPubKey =
                this.recoverEcdsaSecp256k1Key(
                    chainId,
                    nonce,
                    maxPriorityFee,
                    maxGasFee,
                    gasLimit,
                    Buffer.from(receiver),
                    amount,
                    callData,
                    recId,
                    Buffer.from(r, 'hex'),
                    Buffer.from(s, 'hex')
                );
        }

        if (senderPubKey != null) {
            this._senderId = PublicKey.fromBytesECDSA(senderPubKey).toAccountId(0,0);
        }

        if (callDataStart != null && callDataLength != null && nonce != null) {
            this.setForeignTransactionData(
                new ForeignTransactionData(
                    {
                        foreignTransactionType: 2,
                        foreignTransactionBytes: Buffer.from(foreignTx, 'hex'),
                        payloadStart: callDataStart,
                        payloadLength: callDataLength,
                        nonce: nonce
                    }
                )
            );

        }


        try {
            if (receiver != null) {
                console.log(receiver);
                this.setContractId(ContractId.fromSolidityAddress(receiver));
            }
        } catch (e) {
            console.log(e);
            throw e;
        }

        console.log(this._contractId);

        if (gasLimit != null) {
            this.setGas(gasLimit);
        }

        if (amount != null) {
            this.setPayableAmount(new Hbar(amount.toString(), HbarUnit.Tinybar));
        }

        this._functionParameters = null;

        return this;
    }

    /**
     *
     * @param {number} chainId
     * @param {number} nonce
     * @param {BigInt} maxPriorityFee
     * @param {BigInt} maxGasFee
     * @param {number} gasLimit
     * @param {Uint8Array} receiver
     * @param {BigInt} amount
     * @param {Uint8Array} callData
     * @param {number} recId
     * @param {Uint8Array} r
     * @param {Uint8Array} s
     * @reture {Uint8Array}
     */
    recoverEcdsaSecp256k1Key(
        chainId,
        nonce,
        maxPriorityFee,
        maxGasFee,
        gasLimit,
        receiver,
        amount,
        callData,
        recId,
        r,
        s
    ) {
        const message =
            RLP.encode(
                [
                    2,
                    [
                        chainId,
                        nonce,
                        maxPriorityFee.valueOf(),
                        maxGasFee.valueOf(),
                        gasLimit,
                        receiver,
                        amount.valueOf(),
                        callData,
                        []
                    ]
                ]
           );

        const signature = Buffer.concat([r,s]);

        const hash = keccak256(Buffer.from(message));

        const newPubKey = secp256k1.ecdsaRecover(signature, recId, hash, true);

        return newPubKey;
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
        console.log("hit _execute");
        console.log(request);
        if (request.signedTransactionBytes != null) {
            console.log(Buffer.from(request.signedTransactionBytes).toString('hex'));
            console.log(request.signedTransactionBytes.length);
        }
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
