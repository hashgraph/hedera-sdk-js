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
import {ForeignTransactionType} from "@hashgraph/proto";
import ForeignTransactionData from "../transaction/ForeignTransactionData.js";
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
 * @typedef {import("../account/AccountId.js").default} AccountId
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
     * @param {AccountId[]} nodeIds
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
     */
    populateFromForeignTransaction(foreignTx) {
        const uintArrayTxn = new TextEncoder().encode(foreignTx);
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
     */
    populateFromEIP2930Tx(foreignTx) {
        // throw new RuntimeException("NIY");
    }

    /**
     * @param {string} foreignTx
     */
    populateFromEthTx(foreignTx) {
        // throw new RuntimeException("NIY");
    }

    /**
     * @param {string} foreignTx
     */
    populateFromEIP1559Tx(foreignTx) {
        if (foreignTx.startsWith("0x")) {
            foreignTx = foreignTx.substring(2);
        }

        var data = Buffer.from(foreignTx, 'hex');

        var decoded =
            RLP.decode(Uint8Array.from(data));

        console.log(decoded);

        var chainId = ArrayBuffer.isView(decoded[0])
            ? Buffer.from(decoded[0]).readIntBE(0,decoded[0].length)
            : null;

        var nonce = ArrayBuffer.isView(decoded[1])
            ? Buffer.from(decoded[1]).readIntBE(0,decoded[1].length)
            : null;

        var maxPriorityFee = ArrayBuffer.isView(decoded[2])
            ? bufToBigint(Buffer.from(decoded[2]))
            : null;

        var maxGasFee = ArrayBuffer.isView(decoded[3])
            ? bufToBigint(Buffer.from(decoded[3]))
            : null;

        var gasLimit = ArrayBuffer.isView(decoded[4])
            ? Buffer.from(decoded[4]).readIntBE(0,decoded[4].length)
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
        var accessList = decoded[8];

        var recId = ArrayBuffer.isView(decoded[9])
            ? Buffer.from(decoded[9]).readIntBE(0,decoded[9].length)
            : null;

        var r = ArrayBuffer.isView(decoded[10])
            ? Buffer.from(decoded[10]).toString('hex')
            : null;

        var s = ArrayBuffer.isView(decoded[11])
            ? Buffer.from(decoded[11]).toString('hex')
            : null;

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

        )
        var senderPubKey =
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
                Buffer.from(r),
                Buffer.from(s)
            );

        if (callDataStart != null && callDataLength != null && nonce != null) {
            this.setForeignTransactionData(
                new ForeignTransactionData()
                    .setForeignTransactionType(ForeignTransactionType.ETHEREUM_EIP_1559)
                    .setForeignTransactionBytes(Buffer.from(foreignTx))
                    .setPayloadStart(callDataStart)
                    .setPayloadLength(callDataLength)
                    .setNonce(nonce)
            );
        }

        //
        // senderId = AccountId.fromProtobuf(AccountID.newBuilder().setAlias(ByteString.copyFrom(senderPubKey)).build());
        // contractId = ContractId.fromSolidityAddress(Hex.toHexString(receiver));
        // gas = gasLimit;
        // payableAmount = new Hbar(amount.longValueExact(), HbarUnit.TINYBAR);
        // functionParameters = null;
        //
        // return this;
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

        const newPubKey = secp256k1.ecdsaRecover(signature, recId, message, true)

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
