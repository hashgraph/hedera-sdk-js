import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {ContractCreateTransactionBody} from "../generated/ContractCreate_pb";
import {getProtoAccountId, tinybarToString, newDuration} from "../util";
import BigNumber from "bignumber.js";
import {SmartContractService} from "../generated/SmartContractService_pb_service";
import {FileID} from "../generated/BasicTypes_pb";

import {AccountId, Tinybar, FileId} from "../typedefs";
import {Hbar} from "../Hbar";
import {PublicKey} from "../Keys";

export class ContractCreateTransaction extends TransactionBuilder {
    private readonly body: ContractCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractCreateTransactionBody();
        this.inner.setContractcreateinstance(this.body);
    }

    protected doValidate(errors: string[]): void {
        const fileId = this.body.getFileid()!;

        if (fileId == null) {
            errors.push('ContractCreateTransaction must have BytecodeFile set');
            return;
        }
    }

    public setBytecodeFile({ shard, realm, file }: FileId): this {
        const fileId = new FileID();
        fileId.setShardnum(shard);
        fileId.setRealmnum(realm);
        fileId.setFilenum(file);
        this.body.setFileid(fileId);
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this.body.setAdminkey(publicKey.toProtoKey());
        return this;
    }

    public setGas(gas: number | BigNumber): this {
        this.body.setGas(String(gas));
        return this;
    }

    public setInitialBalance(intialBalance: Tinybar | Hbar): this {
        this.body.setInitialbalance(tinybarToString(intialBalance));
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this.body.setProxyaccountid(getProtoAccountId(proxyAccountId));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setConstructorParams(constructorParams: Uint8Array | string): this {
        this.body.setConstructorparameters(constructorParams);
        return this;
    }
    // eslint-disable-next-line unicorn/expiring-todo-comments
    // TODO: Uncomment when implemented by Hedera Hashgraph
    // RealmID requires ShardID to also be provided, so combine both as to not override ShardID
    // unintentionally
    // public setRealmId({ shard, realm }: RealmId): this {
    //     const protoRealmId = new RealmID();
    //     protoRealmId.setShardnum(shard);
    //     protoRealmId.setRealmnum(realm);
    //     this.body.setRealmid(protoRealmId);
    //     return this;
    // }

    // eslint-disable-next-line unicorn/expiring-todo-comments
    // TODO: setNewRealmAdminKey

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.createContract;
    }
}
