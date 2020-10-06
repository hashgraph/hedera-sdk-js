import * as proto from "@hashgraph/proto";
import Channel from "../channel/Channel";
import Transaction, { TRANSACTION_REGISTRY } from "../transaction/Transaction";
import FileId from "../file/FileId";
import ContractId from "../contract/ContractId";
import Timestamp from "../Timestamp";

export default class SystemUndeleteTransaction extends Transaction {
    /**
     * @param {object} props
     * @param {FileId | string} [props.fileId]
     * @param {ContractId | string} [props.contractId]
     * @param {Timestamp} [props.expirationTime]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?FileId}
         */
        this._fileId = null;

        /**
         * @private
         * @type {?ContractId}
         */
        this._contractId = null;

        if (props.fileId != null) {
            this.setFileId(props.fileId);
        }

        if (props.contractId != null) {
            this.setContractId(props.contractId);
        }
    }

    /**
     * @internal
     * @param {proto.TransactionBody} body
     * @returns {SystemUndeleteTransaction}
     */
    static _fromProtobuf(body) {
        const systemUndelete = /** @type {proto.ISystemUndeleteTransactionBody} */ (body.systemUndelete);

        return new SystemUndeleteTransaction({
            fileId:
                systemUndelete.fileID != null
                    ? FileId._fromProtobuf(
                          /** @type {proto.IFileID} */ (systemUndelete.fileID)
                      )
                    : undefined,
            contractId:
                systemUndelete.contractID != null
                    ? ContractId._fromProtobuf(
                          /** @type {proto.IContractID} */ (systemUndelete.contractID)
                      )
                    : undefined,
        });
    }

    /**
     * @returns {?FileId}
     */
    get fileId() {
        return this._fileId;
    }

    /**
     * @param {FileId | string} fileId
     * @returns {this}
     */
    setFileId(fileId) {
        this._requireNotFrozen();
        this._fileId =
            fileId instanceof FileId ? fileId : FileId.fromString(fileId);

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
     * @override
     * @protected
     * @param {Channel} channel
     * @returns {(transaction: proto.ITransaction) => Promise<proto.ITransactionResponse>}
     */
    _getMethod(channel) {
        if (this._fileId != null) {
            return (transaction) => channel.file.systemUndelete(transaction);
        } else {
            return (transaction) =>
                channel.smartContract.systemUndelete(transaction);
        }
    }

    /**
     * @override
     * @protected
     * @returns {NonNullable<proto.TransactionBody["data"]>}
     */
    _getTransactionDataCase() {
        return "systemUndelete";
    }

    /**
     * @override
     * @protected
     * @returns {proto.ISystemUndeleteTransactionBody}
     */
    _makeTransactionData() {
        return {
            fileID: this._fileId != null ? this._fileId._toProtobuf() : null,
            contractID:
                this._contractId != null
                    ? this._contractId._toProtobuf()
                    : null,
        };
    }
}

TRANSACTION_REGISTRY.set(
    "systemUndelete",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    SystemUndeleteTransaction._fromProtobuf
);
