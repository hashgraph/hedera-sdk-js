import { TransactionBuilder } from "../TransactionBuilder";
import { Transaction } from "../generated/Transaction_pb";
import { TransactionResponse } from "../generated/TransactionResponse_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { BaseClient } from "../BaseClient";
import { ContractCreateTransactionBody } from "../generated/ContractCreate_pb";
import { getProtoAccountId, getProtoFileId, newDuration, tinybarToString } from "../util";
import BigNumber from "bignumber.js";
import { SmartContractService } from "../generated/SmartContractService_pb_service";

import { AccountId, FileIdLike, Tinybar } from "../typedefs";
import { Hbar } from "../Hbar";
import { PublicKey } from "../Keys";

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
            errors.push("ContractCreateTransaction must have BytecodeFile set");
        }
    }

    public setBytecodeFile(fileIdLike: FileIdLike): this {
        this.body.setFileid(getProtoFileId(fileIdLike));
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

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.createContract;
    }
}
