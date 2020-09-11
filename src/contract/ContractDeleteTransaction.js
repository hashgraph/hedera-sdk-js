import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../Transaction";
import { _toProtoKey } from "../util";
import ContractId from "./ContractId";
import AccountId from "../account/AccountId";

export default class ContractDeleteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {ContractId | string} [props.contractId]
     * @param {ContractId | string} [props.transferContractId]
     * @param {AccountId | string} [props.transferAccountId]
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
         * @type {?AccountId}
         */
        this._transferAccountId = null;

        /**
         * @private
         * @type {?ContractId}
         */
        this._transferContractId = null;

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }

        if (props.transferAccountId != null) {
            this.setTransferAccountId(props.transferAccountId);
        }

        if (props.transferContractId != null) {
            this.setTransferContractId(props.transferContractId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {ContractDeleteTransaction}
     */
    static _fromProtobuf(body) {
        const contractDelete = /** @type {proto.IContractDeleteTransactionBody} */ (body.contractDeleteInstance);

        return new ContractDeleteTransaction({
            contractId:
                contractDelete.contractID != null
                    ? ContractId._fromProtobuf(
                          /** @type {proto.ContractID} */ (contractDelete.contractID)
                      )
                    : undefined,
            transferAccountId:
                contractDelete.transferAccountID != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.AccountID} */ (contractDelete.transferAccountID)
                      )
                    : undefined,
            transferContractId:
                contractDelete.transferContractID != null
                    ? ContractId._fromProtobuf(
                          /** @type {proto.ContractID} */ (contractDelete.transferContractID)
                      )
                    : undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    getContractId() {
        return this._contractId;
    }

    /**
     * Sets the contract ID which is being deleted in this transaction.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractDeleteTransaction}
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
     * @returns {?ContractId}
     */
    getTransferContractId() {
        return this._transferContractId;
    }

    /**
     * Sets the contract ID which will receive all remaining hbars.
     *
     * @param {ContractId | string} transferContractId
     * @returns {ContractDeleteTransaction}
     */
    setTransferContractId(transferContractId) {
        this._requireNotFrozen();
        this._transferContractId =
            transferContractId instanceof ContractId
                ? transferContractId
                : ContractId.fromString(transferContractId);

        return this;
    }

    /**
     * @returns {?AccountId}
     */
    getTransferAccountId() {
        return this._transferAccountId;
    }

    /**
     * Sets the account ID which will receive all remaining hbars.
     *
     * @param {AccountId | string} transferAccountId
     * @returns {ContractDeleteTransaction}
     */
    setTransferAccountId(transferAccountId) {
        this._requireNotFrozen();
        this._transferAccountId =
            transferAccountId instanceof AccountId
                ? transferAccountId
                : AccountId.fromString(transferAccountId);

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
            channel.smartContract.deleteContract(transaction);
    }

    /**
     * @override
     * @protected
     * @returns {proto.TransactionBody["data"]}
     */
    _getTransactionDataCase() {
        return "contractDeleteInstance";
    }

    /**
     * @override
     * @protected
     * @returns {proto.IContractDeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            contractID:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
            transferAccountID: this._transferAccountId
                ? this._transferAccountId._toProtobuf()
                : null,
            transferContractID:
                this._transferContractId != null
                    ? this._transferContractId._toProtobuf()
                    : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "contractDeleteInstance",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ContractDeleteTransaction._fromProtobuf
);
