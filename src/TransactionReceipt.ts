import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId } from "./account/AccountId";
import { ContractId } from "./contract/ContractId";
import { FileId } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";
import { Status } from "./Status";

export class TransactionReceipt {
    public readonly status: Status;
    private _accountId: AccountId | null;
    private _fileId: FileId | null;
    private _contractId: ContractId | null;
    public readonly exchangeRateSet: ExchangeRateSet | null;

    private constructor(
        status: Status,
        _accountId: AccountId | null,
        _fileId: FileId | null,
        _contractId: ContractId | null,
        exchangeRateSet: ExchangeRateSet | null
    ) {
        this.status = status;
        this._accountId = _accountId;
        this._fileId = _fileId;
        this._contractId = _contractId;
        this.exchangeRateSet = exchangeRateSet;
    }

    public getAccountId(): AccountId {
        return this._accountId!;
    }

    public getFileId(): FileId {
        return this._fileId!;
    }

    public getContractId(): ContractId {
        return this._contractId!;
    }

    // NOT A STABLE API
    public static _fromProto(receipt: ProtoTransactionReceipt): TransactionReceipt {
        return new TransactionReceipt(
            receipt.getStatus(),
            receipt.hasAccountid() ? AccountId._fromProto(receipt.getAccountid()!) : null,
            receipt.hasFileid() ? FileId._fromProto(receipt.getFileid()!) : null,
            receipt.hasContractid() ?
                ContractId._fromProto(receipt.getContractid()!) :
                null,
            receipt.hasExchangerate() ?
                exchangeRateSetToSdk(receipt.getExchangerate()!) :
                null
        );
    }
}
