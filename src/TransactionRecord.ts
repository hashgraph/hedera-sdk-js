import { TransactionReceipt } from "./TransactionReceipt";
import { ContractFunctionResult } from "./contract/ContractFunctionResult";
import { TransactionRecord as ProtoTransactionRecord } from "./generated/TransactionRecord_pb";
import { TransactionId } from "./TransactionId";
import {
    TransferList as ProtoTransferList,
    TokenTransferList as ProtoTokenTransferList,
    AccountAmount as ProtoAccountAmount
} from "./generated/BasicTypes_pb";
import { Time } from "./Time";
import { Hbar } from "./Hbar";
import { TokenId, TokenIdLike } from "./token/TokenId";
import { AccountId, AccountIdLike } from "./account/AccountId";
import { Transfer, transferFromProto } from "./Transfer";
import BigNumber from "bignumber.js";

const callResult = Symbol("callResult");

const callResultIsCreate = Symbol("callResultIsCreate");

export class AccountTokenTransfersMap {
    private _transfers: Map<string, BigNumber[]> = new Map();

    public constructor(transfers: ProtoAccountAmount[]) {
        for (const transfer of transfers) {
            const accountId = AccountId._fromProto(transfer.getAccountid()!).toString();
            let list = this._transfers.get(accountId);

            if (list == null) {
                list = [];
                this._transfers.set(accountId, list);
            }

            list.push(new BigNumber(transfer.getAmount()!));
        }
    }

    public get(accountId: AccountIdLike): BigNumber[] | undefined {
        const account = new AccountId(accountId).toString();
        return this._transfers.get(account);
    }

    public values(): IterableIterator<BigNumber[]> {
        return this._transfers.values();
    }

    public keys(): IterableIterator<AccountId> {
        const keys = [];
        for (const key of this._transfers.keys()) {
            keys.push(AccountId.fromString(key));
        }
        return keys[ Symbol.iterator ]();
    }

    public [ Symbol.iterator ](): IterableIterator<[AccountId, BigNumber[]]> {
        const map = new Map();
        for (const [ key, value ] of this._transfers) {
            map.set(AccountId.fromString(key), value);
        }
        return map[ Symbol.iterator ]();
    }
}

export class TokenTransfersMap {
    private _transfers: Map<string, AccountTokenTransfersMap> = new Map();

    public constructor(transfers: ProtoTokenTransferList[]) {
        for (const list of transfers) {
            const tokenId = TokenId._fromProto(list.getToken()!);

            this._transfers.set(
                tokenId.toString(),
                new AccountTokenTransfersMap(list.getTransfersList())
            );
        }
    }

    public get(tokenId: TokenIdLike): AccountTokenTransfersMap | undefined {
        const token = new TokenId(tokenId).toString();
        return this._transfers.get(token);
    }

    public values(): IterableIterator<AccountTokenTransfersMap> {
        return this._transfers.values();
    }

    public keys(): IterableIterator<TokenId> {
        const keys = [];
        for (const key of this._transfers.keys()) {
            keys.push(TokenId.fromString(key));
        }
        return keys[ Symbol.iterator ]();
    }

    public [ Symbol.iterator ](): IterableIterator<[TokenId, AccountTokenTransfersMap]> {
        const map = new Map();
        for (const [ key, value ] of this._transfers) {
            map.set(TokenId.fromString(key), value);
        }
        return map[ Symbol.iterator ]();
    }
}

/**
 * Response when the client sends the node TransactionGetRecordResponse.
 */
export class TransactionRecord {
    private readonly [ callResult ]: ContractFunctionResult | null = null;

    private readonly [ callResultIsCreate ]: boolean = false;

    /**
     * The status (reach consensus, or failed, or is unknown) and the ID of
     * any new account/file/instance created.
     */
    public readonly receipt: TransactionReceipt | null;

    /**
     * The hash of the Transaction that executed (not the hash of any Transaction that failed
     * for having a duplicate TransactionID).
     */
    public readonly transactionHash: Uint8Array;

    /**
     * The consensus timestamp (or null if didn't reach consensus yet).
     */
    public readonly consensusTimestamp: Time;

    /**
     * The ID of the transaction this record represents.
     */
    public readonly transactionId: TransactionId;

    /**
     * The memo that was submitted as part of the transaction (max 100 bytes).
     */
    public readonly transactionMemo: string;

    /**
     * The actual transaction fee charged,
     * not the original transactionFee value from TransactionBody.
     */
    public readonly transactionFee: Hbar;

    /**
     * All hbar transfers as a result of this transaction, such as fees, or transfers performed
     * by the transaction, or by a smart contract it calls, or by the creation of threshold
     * records that it triggers.
     */
    public readonly transfers: Transfer[];

    public readonly tokenTransfers: TokenTransfersMap;

    private constructor(record: ProtoTransactionRecord) {
        this.receipt = TransactionReceipt._fromProto(record.getReceipt()!);
        this.transactionHash = record.getTransactionhash_asU8();
        this.consensusTimestamp = Time._fromProto(record.getConsensustimestamp()!);
        this.transactionId = TransactionId._fromProto(record.getTransactionid()!);
        this.transactionMemo = record.getMemo();
        this.transactionFee = Hbar.fromTinybar(record.getTransactionfee());
        this.transfers = transferListToSdk(record.getTransferlist()!);

        if (record.hasContractcallresult()) {
            this[ callResult ] = new ContractFunctionResult(record.getContractcallresult()!);
            this[ callResultIsCreate ] = true;
        } else if (record.hasContractcreateresult()) {
            this[ callResult ] = new ContractFunctionResult(record.getContractcreateresult()!);
        }

        this.tokenTransfers = new TokenTransfersMap(record.getTokentransferlistsList());
    }

    public static _fromProto(pb: ProtoTransactionRecord): TransactionRecord {
        return new TransactionRecord(pb);
    }

    public getContractCreateResult(): ContractFunctionResult {
        if (this[ callResult ] == null || this[ callResultIsCreate ]) {
            throw new Error("record does not contain a contract create result");
        }

        return this[ callResult ]!;
    }

    public getContractExecuteResult(): ContractFunctionResult {
        if (this[ callResult ] == null || !this[ callResultIsCreate ]) {
            throw new Error("record does not contain a contract execute result");
        }

        return this[ callResult ]!;
    }
}

export function transferListToSdk(transferList: ProtoTransferList): Transfer[] {
    return transferList.getAccountamountsList().map(transferFromProto);
}
