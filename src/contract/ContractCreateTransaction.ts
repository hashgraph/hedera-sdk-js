import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { ContractCreateTransactionBody } from "../generated/ContractCreate_pb";
import { newDuration } from "../util";
import BigNumber from "bignumber.js";
import { SmartContractService } from "../generated/SmartContractService_pb_service";

import { Tinybar, tinybarToString } from "../Tinybar";
import { Hbar } from "../Hbar";
import { PublicKey } from "../crypto/PublicKey";
import { FileId, FileIdLike } from "../file/FileId";
import { AccountId, AccountIdLike } from "../account/AccountId";
import { ContractFunctionParams } from "./ContractFunctionParams";
import { ShardID, RealmID } from "../generated/BasicTypes_pb";
import { TransactionId, TransactionIdLike } from "../TransactionId";

export class ContractCreateTransaction extends TransactionBuilder {
    private readonly _body: ContractCreateTransactionBody;

    public constructor() {
        super();
        this._body = new ContractCreateTransactionBody();
        this._inner.setContractcreateinstance(this._body);
    }

    public setTransactionId(txLike: TransactionIdLike): this {
        const txId = new TransactionId(txLike);

        if (!this._body.hasShardid()) {
            this.setShardId(txId.accountId.shard);
        }

        if (!this._body.hasRealmid()) {
            this.setRealmId(txId.accountId.realm);
        }

        return super.setTransactionId(txId);
    }

    public setBytecodeFileId(fileIdLike: FileIdLike): this {
        this._body.setFileid(new FileId(fileIdLike)._toProto());
        return this;
    }

    public setAdminKey(publicKey: PublicKey): this {
        this._body.setAdminkey(publicKey._toProtoKey());
        return this;
    }

    public setGas(gas: number | BigNumber): this {
        this._body.setGas(String(gas));
        return this;
    }

    public setInitialBalance(intialBalance: Tinybar | Hbar): this {
        this._body.setInitialbalance(tinybarToString(intialBalance));
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountIdLike): this {
        this._body.setProxyaccountid(new AccountId(proxyAccountId)._toProto());
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setConstructorParams(constructorParams: ContractFunctionParams): this {
        this._body.setConstructorparameters(constructorParams._build(null));
        return this;
    }

    public setRealmId(realmnum: number): this {
        const realm = new RealmID();
        realm.setRealmnum(realmnum);
        realm.setShardnum(this._body.hasShardid() ? this._body.getShardid()!.getShardnum() : 0);
        this._body.setRealmid(realm);
        return this;
    }

    public setShardId(shardnum: number): this {
        const shard = new ShardID();
        shard.setShardnum(shardnum);
        this._body.setShardid(shard);
        return this;
    }

    public setNewRealmAdminKey(key: PublicKey): this {
        this._body.setNewrealmadminkey(key._toProtoKey());
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._body.hasFileid()) {
            errors.push(".setBytecodeFile() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.createContract;
    }
}
