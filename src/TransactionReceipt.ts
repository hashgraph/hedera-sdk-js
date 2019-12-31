import { TransactionReceipt as ProtoTransactionReceipt } from "./generated/TransactionReceipt_pb";
import { AccountId } from "./account/AccountId";
import { ContractId } from "./contract/ContractId";
import { FileId } from "./file/FileId";
import { ExchangeRateSet, exchangeRateSetToSdk } from "./ExchangeRate";
import { Status } from "./Status";

export class TransactionReceipt {
    public readonly status: Status;
    private accountId: AccountId | null;
    private fileId: FileId | null;
    private contractId: ContractId | null;
    public readonly exchangeRateSet: ExchangeRateSet | null;

    private constructor(
        status: Status,
        accountId: AccountId | null,
        fileId: FileId | null,
        contractId: ContractId | null,
        exchangeRateSet: ExchangeRateSet | null
    ) {
        this.status = status;
        this.accountId = accountId;
        this.fileId = fileId;
        this.contractId = contractId;
        this.exchangeRateSet = exchangeRateSet;
    }

    public getAccountId(): AccountId {
        return this.accountId!;
    }

    public getFileId(): FileId {
        return this.fileId!;
    }

    public getContractId(): ContractId {
        return this.contractId!;
    }

    public static fromProto(receipt: ProtoTransactionReceipt): TransactionReceipt {
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
